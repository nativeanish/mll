import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { useBlockStore } from "@/store/useBlockStore";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { uuidv7 } from "uuidv7";

interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
  uuid?: string;
}
interface LocalFileMeta {
  id: string; // local id
  url: string; // object URL
  name: string; // original file name
  title: string; // user defined title
  size: number;
  type: string;
}
function BlockForFile({ isEdit, uuid }: Props) {
  const [description, setDescription] = useState<string>("");
  const [files, setFiles] = useState<LocalFileMeta[]>([]);
  const updateBlock = useBlockStore((state) => state.updateBlockData);
  const onSelectFiles = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      if (!list) return;
      const newMetas: LocalFileMeta[] = [];
      for (let i = 0; i < list.length; i++) {
        const file = list.item(i)!;
        const objectUrl = URL.createObjectURL(file);
        newMetas.push({
          id: uuidv7(),
          url: objectUrl,
          name: file.name,
          // initial title: strip extension
          title: file.name.replace(/\.[^.]+$/, ""),
          size: file.size,
          type: file.type,
        });
      }
      setFiles((prev) => [...prev, ...newMetas]);
      // reset input
      e.target.value = "";
    },
    []
  );

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file && file.url.startsWith("blob:")) URL.revokeObjectURL(file.url);
      return prev.filter((f) => f.id !== id);
    });
  };

  useEffect(() => {
    if (!isEdit && uuid) {
      // when switching from edit to view, update the block data
      updateBlock(uuid, {
        files: files.map(({ id, url, name, title, size, type }) => ({
          id,
          url,
          name,
          title,
          size,
          type,
        })),
        description,
      });
    }
  }, [isEdit, uuid, files, description, updateBlock]);
  return (
    <div>
      {isEdit ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label
            // htmlFor={`file-input-${data.id}`}
            >
              Add Files
            </Label>
            <Input
              //   id={`file-input-${data.id}`}
              type="file"
              multiple
              onChange={onSelectFiles}
              className="bg-muted/40"
            />
            <p className="text-[10px] text-muted-foreground">
              You can select multiple files (stored locally, not uploaded).
            </p>
          </div>
          <div className="space-y-3">
            {files.length === 0 && (
              <div className="text-sm text-muted-foreground italic p-2 dark:bg-muted/30 bg-black/20 rounded-lg ">
                No files added yet.
              </div>
            )}
            {files.map((f, idx) => (
              <div
                key={f.id}
                className="flex flex-col sm:flex-row gap-2 p-3 bg-muted/30 rounded-lg min-w-0"
              >
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                      {idx + 1}
                    </span>
                    <span
                      className="text-xs text-muted-foreground block truncate min-w-0 flex-1"
                      title={f.name}
                    >
                      {f.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                      {(f.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <Input
                    value={f.title}
                    placeholder="File title"
                    onChange={(e) =>
                      setFiles((prev) =>
                        prev.map((p) =>
                          p.id === f.id ? { ...p, title: e.target.value } : p
                        )
                      )
                    }
                    className="bg-background/50 truncate min-w-0"
                  />
                </div>
                <div className="flex items-start gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeFile(f.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => window.open(f.url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label
            // htmlFor={`desc-${data.id}`}
            >
              Description (optional)
            </Label>
            <Textarea
              //   id={`desc-${data.id}`}
              placeholder="Describe these files..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-20 bg-muted/40"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {files.length === 0 ? (
              <div className="p-3 rounded-lg bg-muted/30 text-sm dark:text-muted-foreground italic">
                No files added.
              </div>
            ) : (
              files.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 p-3 dark:bg-muted/30 bg-black/30 rounded-lg min-w-0"
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      title={f.title || f.name}
                    >
                      {f.title || f.name}
                    </p>
                    <p
                      className="text-[10px] dark:text-muted-foreground truncate"
                      title={f.name}
                    >
                      {f.name}
                    </p>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          toast.success("File URL copied to clipboard");
                          navigator.clipboard.writeText(f.url);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={4}>
                      Copy File URL to Clipboard
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          toast.success("File opened in new tab");
                          window.open(f.url, "_blank");
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={4}>
                      Open File in New Tab
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))
            )}
          </div>
          {description && (
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">
                Description:
              </span>
              <p className="text-sm text-foreground">{description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BlockForFile;
