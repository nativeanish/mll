import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { useBlockStore } from "@/store/useBlockStore";
import useWallet from "@/store/useWallet";
import {
  ExternalLink,
  HardDrive,
  Loader2,
  Pin,
  PinOff,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
  uuid: string;
}

interface ArDriveMeta {
  name: string;
  rootFolderId: string;
  isHidden: boolean | null;
}

interface DriveInfo {
  driveId: string;
  nodeId: string;
  name: string;
  rootFolderId: string;
}

interface DriveFile {
  nodeId: string;
  name: string;
  size: number;
  dataContentType: string;
  dataTxId: string;
  lastModifiedDate: number;
  pinned: boolean;
}

/* ── constants ── */

const GQL_ENDPOINT = "https://ardrive.net/graphql";

const GQL_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "*/*",
  Origin: "https://app.ardrive.io",
  Referer: "https://app.ardrive.io/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
};

/* ── queries ── */

const USER_DRIVES_QUERY = `
  query UserDriveEntities($owner: String!) {
    transactions(
      first: 100
      after: ""
      sort: HEIGHT_DESC
      tags: [{ name: "Entity-Type", values: ["drive"] }]
      owners: [$owner]
    ) {
      edges {
        node {
          id
          owner { address }
          bundledIn { id }
          block { height timestamp }
          tags { name value }
        }
        cursor
      }
      pageInfo { hasNextPage }
    }
  }
`;

const DRIVE_ENTITIES_QUERY = `
  query PendingDriveEntities($driveId: String!, $after: String, $ownerAddress: String!) {
    transactions(
      owners: [$ownerAddress]
      first: 100
      sort: HEIGHT_DESC
      tags: [{ name: "Drive-Id", values: [$driveId] }]
      after: $after
    ) {
      pageInfo { hasNextPage }
      edges {
        node {
          id
          owner { address }
          bundledIn { id }
          block { height timestamp }
          tags { name value }
        }
        cursor
      }
    }
  }
`;

/* ── helpers ── */

function getTagValue(
  tags: { name: string; value: string }[],
  name: string,
): string | undefined {
  return tags.find((t) => t.name === name)?.value;
}

async function gqlFetch(query: string, variables: Record<string, string>) {
  const res = await fetch(GQL_ENDPOINT, {
    method: "POST",
    headers: GQL_HEADERS,
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`);
  return res.json();
}

async function fetchArweaveMetadata(nodeId: string) {
  const res = await fetch(`https://arweave.net/${nodeId}`);
  if (!res.ok) throw new Error(`Arweave fetch failed: ${res.status}`);
  return res.json();
}

/* ── component ── */

function BlockForArDrive({ isEdit, setError, uuid }: Props) {
  const address = useWallet((state) => state.address);
  const updateBlock = useBlockStore((state) => state.updateBlockData);

  // state
  const [loading, setLoading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [drives, setDrives] = useState<DriveInfo[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<DriveInfo | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [expanded, setExpanded] = useState(false);

  const pinnedFiles = files.filter((f) => f.pinned);
  const MAX_COLLAPSED = 4;

  /* ── fetch public drives ── */
  const fetchDrives = useCallback(async () => {
    if (!address) {
      toast.error("Wallet not connected");
      setError(true);
      return;
    }

    try {
      setLoading(true);
      setError(false);

      const result = await gqlFetch(USER_DRIVES_QUERY, { owner: address });
      const edges = result?.data?.transactions?.edges ?? [];

      // filter public drives
      const publicEdges = edges.filter(
        (edge: { node: { tags: { name: string; value: string }[] } }) =>
          getTagValue(edge.node.tags, "Drive-Privacy") === "public",
      );

      if (publicEdges.length === 0) {
        toast.warning("No public ArDrive drives found");
        setDrives([]);
        return;
      }

      // fetch metadata for each public drive in parallel
      const driveInfos: DriveInfo[] = await Promise.all(
        publicEdges.map(
          async (edge: {
            node: { id: string; tags: { name: string; value: string }[] };
          }) => {
            const driveId = getTagValue(edge.node.tags, "Drive-Id") ?? "";
            try {
              const meta: ArDriveMeta = await fetchArweaveMetadata(
                edge.node.id,
              );
              return {
                driveId,
                nodeId: edge.node.id,
                name: meta.name || "Unnamed Drive",
                rootFolderId: meta.rootFolderId || "",
              };
            } catch {
              return {
                driveId,
                nodeId: edge.node.id,
                name: "Unnamed Drive",
                rootFolderId: "",
              };
            }
          },
        ),
      );

      setDrives(driveInfos);
      toast.success(`Found ${driveInfos.length} public drive(s)`);
    } catch (err) {
      console.error("Failed to fetch ArDrive drives:", err);
      toast.error("Failed to fetch ArDrive drives");
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [address, setError]);

  /* ── fetch drive files ── */
  const fetchDriveFiles = useCallback(
    async (drive: DriveInfo) => {
      if (!address) return;

      try {
        setLoadingFiles(true);
        const result = await gqlFetch(DRIVE_ENTITIES_QUERY, {
          driveId: drive.driveId,
          after: "",
          ownerAddress: address,
        });

        const edges = result?.data?.transactions?.edges ?? [];

        // filter only file entities
        const fileEdges = edges.filter(
          (edge: { node: { tags: { name: string; value: string }[] } }) =>
            getTagValue(edge.node.tags, "Entity-Type") === "file",
        );

        // fetch metadata for each file
        const driveFiles: DriveFile[] = (
          await Promise.all(
            fileEdges.map(async (edge: { node: { id: string } }) => {
              try {
                const meta = await fetchArweaveMetadata(edge.node.id);
                return {
                  nodeId: edge.node.id,
                  name: meta.name || "Unknown file",
                  size: meta.size || 0,
                  dataContentType: meta.dataContentType || "",
                  dataTxId: meta.dataTxId || "",
                  lastModifiedDate: meta.lastModifiedDate || 0,
                  pinned: false,
                };
              } catch {
                return null;
              }
            }),
          )
        ).filter(Boolean) as DriveFile[];

        setFiles(driveFiles);
        toast.success(`Loaded ${driveFiles.length} file(s)`);
      } catch (err) {
        console.error("Failed to fetch drive files:", err);
        toast.error("Failed to fetch drive files");
      } finally {
        setLoadingFiles(false);
      }
    },
    [address],
  );

  /* ── select drive ── */
  const handleSelectDrive = useCallback(
    (drive: DriveInfo) => {
      setSelectedDrive(drive);
      setFiles([]);
      setExpanded(false);
      fetchDriveFiles(drive);
    },
    [fetchDriveFiles],
  );

  /* ── toggle pin ── */
  const togglePin = (nodeId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.nodeId === nodeId ? { ...f, pinned: !f.pinned } : f)),
    );
  };

  /* ── sync to store ── */
  useEffect(() => {
    if (!isEdit && uuid) {
      updateBlock(uuid, {
        selectedDrive,
        pinnedFiles: files.filter((f) => f.pinned),
        allFiles: files,
      });
    }
  }, [isEdit, uuid, selectedDrive, files, updateBlock]);

  /* ── edit mode ── */
  if (isEdit) {
    return (
      <div className="space-y-4">
        {/* fetch drives */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">ArDrive Public Drives</Label>
          <p className="text-xs text-muted-foreground">
            Fetch your public ArDrive drives to attach files.
          </p>
          <Button
            onClick={fetchDrives}
            disabled={loading || !address}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <HardDrive className="h-4 w-4 mr-2" />
            )}
            {loading ? "Fetching Drives..." : "Fetch Drives"}
          </Button>
          {!address && (
            <p className="text-xs text-red-500">
              Please connect your wallet first.
            </p>
          )}
        </div>

        {/* drive list */}
        {drives.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select a Drive</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {drives.map((drive) => (
                <button
                  key={drive.driveId}
                  type="button"
                  onClick={() => handleSelectDrive(drive)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left cursor-pointer ${
                    selectedDrive?.driveId === drive.driveId
                      ? "border-primary bg-primary/10 shadow-[2px_2px_0px_var(--border)]"
                      : "border-border bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <HardDrive className="h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{drive.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {drive.driveId}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* file list & pin */}
        {selectedDrive && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Files in "{selectedDrive.name}"
              </Label>
              {loadingFiles && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {files.length === 0 && !loadingFiles && (
              <div className="text-sm text-muted-foreground italic p-2 dark:bg-muted/30 bg-black/20 rounded-lg">
                No files found in this drive.
              </div>
            )}

            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {files.map((file) => (
                <div
                  key={file.nodeId}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border-2 transition-all ${
                    file.pinned
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/20"
                  }`}
                >
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {file.dataContentType} · {(file.size / 1024).toFixed(1)}{" "}
                      KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => togglePin(file.nodeId)}
                  >
                    {file.pinned ? (
                      <PinOff className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Pin className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>

            {pinnedFiles.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {pinnedFiles.length} file(s) pinned — these will show on your
                page.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ── preview (non-edit) mode ── */
  const visiblePinned = expanded
    ? pinnedFiles
    : pinnedFiles.slice(0, MAX_COLLAPSED);

  return (
    <div className="space-y-3">
      {!selectedDrive ? (
        <p className="text-sm text-muted-foreground italic">
          No ArDrive configured
        </p>
      ) : (
        <>
          {/* drive header */}
          <div className="flex items-center gap-3 p-3 dark:bg-muted/30 bg-black/20 rounded-lg">
            <HardDrive className="h-5 w-5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{selectedDrive.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                ArDrive · {selectedDrive.driveId}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() =>
                window.open(
                  `https://app.ardrive.io/#/drives/${selectedDrive.driveId}?name=${encodeURIComponent(selectedDrive.name)}`,
                  "_blank",
                )
              }
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* pinned files */}
          {pinnedFiles.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground font-medium">
                Pinned Files
              </span>
              {visiblePinned.map((file) => (
                <div
                  key={file.nodeId}
                  className="flex items-center gap-2 p-2 dark:bg-muted/20 bg-black/10 rounded-lg"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
              {pinnedFiles.length > MAX_COLLAPSED && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 text-xs"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" /> Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" /> +
                      {pinnedFiles.length - MAX_COLLAPSED} more
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {pinnedFiles.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              No files pinned yet.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default BlockForArDrive;
