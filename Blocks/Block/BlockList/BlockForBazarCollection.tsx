import { useEffect, useMemo, useRef, useState } from "react";
import { CollectionModal } from "./nftutils/collectionModal";
import useWallet from "@/store/useWallet";
import { useQuery } from "@tanstack/react-query";
import {
  getCollectionAssets,
  getCollectionwithAssets,
  getFullCollections,
} from "@/utils/block/bazarcollection";
import {
  AlertCircle,
  BarChart3,
  ExternalLink,
  ImageIcon,
  Loader2,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import type { CollectionDetailType } from "node_modules/@permaweb/libs/dist/types/helpers";
import BazarAssetViewer from "./nftutils/bazarAssetViewer";
import { toast } from "sonner";
import { Badge } from "@/src/components/ui/badge";
import { Token } from "@/utils/ao/token";

interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
}
interface BazarAsset {
  type: "image" | "video" | "unknown" | "token";
  id: string;
  logoImage: string;
  quantity: string;
}
type ExtendedCollectionDetail = CollectionDetailType & {
  assets?: Array<unknown>;
  assetIds?: string[];
  banner?: string;
  thumbnail?: string;
  title?: string;
  name?: string;
  description?: string;
  dateCreated?: string;
};

type CollectionMetrics = {
  price: number | null;
  pl: number | null;
  currency: string | null;
};
function BlockForBazarCollection({ isEdit }: Props) {
  const pendingSelectionRef = useRef(false);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(true);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const address = useWallet((state) => state.address);
  const handleSelectCollection = (selectedCollectionId: string) => {
    pendingSelectionRef.current = true;
    setCollectionId(selectedCollectionId);
    setSelectedAssets([]); // Reset selected assets when changing collection
    // updateBlockData({
    //   id: data.id,
    //   url: `https://bazar.arweave.dev/#/collection/${selectedCollectionId}`,
    //   urls: [selectedCollectionId],
    // });
  };
  const getMultipleCollectionQuery = useQuery({
    queryKey: ["bazar-collection", address],
    queryFn: () => getFullCollections(),
    enabled:
      !!address && address.trim() !== "" && (showModal || !!collectionId),
    retry: 1,
  });
  const handleModalClose = (open: boolean) => {
    setShowModal(open);
    if (!open) {
      if (pendingSelectionRef.current) {
        pendingSelectionRef.current = false;
        return;
      }

      if (!collectionId) {
        /// Remove from Store
      }
    }
  };
  const getSingleCollectionQuery = useQuery({
    queryKey: ["bazar-collection-single", collectionId],
    queryFn: () =>
      getCollectionwithAssets(
        getMultipleCollectionQuery.data || [],
        collectionId || ""
      ),
    enabled:
      !!collectionId &&
      collectionId.trim() !== "" &&
      !!getMultipleCollectionQuery.data,
    retry: 1,
  });
  const getCollectionAssetsQuery = useQuery({
    queryKey: ["bazar-collection-assets", collectionId],
    queryFn: () => getCollectionAssets(collectionId || ""),
    enabled: !!collectionId && collectionId.trim() !== "" && isEdit,
    retry: 1,
  });
  useEffect(() => {
    if (collectionId) {
      pendingSelectionRef.current = false;
    }
  }, [collectionId]);

  const toggleAssetSelection = (asset: BazarAsset) => {
    setSelectedAssets((prev) => {
      if (prev.includes(asset.id)) {
        return prev.filter((id) => id !== asset.id);
      } else if (prev.length < 5) {
        return [...prev, asset.id];
      } else {
        toast.warning("Maximum 5 assets allowed", {
          description: "You can select up to 5 assets for your collection.",
        });
        return prev;
      }
    });
  };

  const formatPercentage = (percentage: number | null | undefined) => {
    if (typeof percentage !== "number" || Number.isNaN(percentage)) {
      return "N/A";
    }
    return `${percentage.toFixed(1)}%`;
  };

  const selectedCollection = getMultipleCollectionQuery.data?.find(
    (entry: CollectionDetailType) => entry.id === collectionId
  ) as ExtendedCollectionDetail | undefined;

  const assetCount =
    selectedCollection?.assets && Array.isArray(selectedCollection.assets)
      ? selectedCollection.assets.length
      : (selectedCollection?.assetIds?.length ?? 0);

  const createdDate = selectedCollection?.dateCreated
    ? new Date(Number(selectedCollection.dateCreated)).toLocaleDateString()
    : null;
  const collectionMetrics =
    getSingleCollectionQuery.data &&
    typeof getSingleCollectionQuery.data === "object" &&
    !Array.isArray(getSingleCollectionQuery.data)
      ? (getSingleCollectionQuery.data as CollectionMetrics)
      : null;
  const tokenInfo = useMemo(() => {
    if (!collectionMetrics?.currency) {
      return null;
    }
    return Token.find((t) => t.address === collectionMetrics.currency) ?? null;
  }, [collectionMetrics?.currency]);
  const formattedPrice = useMemo(() => {
    const price = collectionMetrics?.price;
    if (typeof price !== "number" || Number.isNaN(price) || !tokenInfo) {
      return "N/A";
    }
    return price / Math.pow(10, tokenInfo.denomination);
  }, [collectionMetrics?.price, tokenInfo]);

  return (
    <div>
      <CollectionModal
        open={showModal}
        onOpenChange={handleModalClose}
        collections={getMultipleCollectionQuery.data}
        isLoading={getMultipleCollectionQuery.isLoading}
        isError={getMultipleCollectionQuery.isError}
        error={getMultipleCollectionQuery.error}
        onSelectCollection={handleSelectCollection}
      />
      {collectionId && !showModal && collectionId.trim() !== "" && (
        <div>
          {getSingleCollectionQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Fetching Collection Data
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Loading metrics and market data...
                  </p>
                </div>
              </div>
            </div>
          ) : getSingleCollectionQuery.isError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-4">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">
                    Failed to Load Collection
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Unable to fetch collection metrics
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  //   onClick={() => removeBlock(data.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Block
                </Button>
              </div>
            </div>
          ) : isEdit ? (
            <div className="space-y-6">
              {/* Collection Preview */}
              {selectedCollection && (
                <div className="space-y-4">
                  <div className="relative">
                    {selectedCollection.banner && (
                      <div className="relative h-32 w-full rounded-lg overflow-hidden bg-muted">
                        <img
                          src={`https://arweave.net/${selectedCollection.banner}`}
                          alt="Collection banner"
                          className="w-full h-full object-cover"
                        />
                        <div
                          className="pointer-events-none absolute inset-0 bg-background/60"
                          aria-hidden="true"
                        />
                      </div>
                    )}

                    <div
                      className={`flex items-start gap-4 ${selectedCollection.banner ? "-mt-8 relative z-10 px-4" : ""}`}
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted border-4 border-background">
                        {selectedCollection.thumbnail ? (
                          <img
                            src={`https://arweave.net/${selectedCollection.thumbnail}`}
                            alt={selectedCollection.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="text-lg font-semibold leading-none">
                            {selectedCollection.name ||
                              selectedCollection.title}
                          </span>
                        </div>

                        {selectedCollection.description && (
                          <p className="text-sm">
                            {selectedCollection.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Asset Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">
                      Select Assets to Display
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Choose up to 5 assets to showcase ({selectedAssets.length}
                      /5 selected)
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowModal(true)}
                  >
                    Change Collection
                  </Button>
                </div>

                {getCollectionAssetsQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center space-y-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                      <p className="text-sm">Loading collection assets...</p>
                    </div>
                  </div>
                ) : getCollectionAssetsQuery.data &&
                  getCollectionAssetsQuery.data.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                    {getCollectionAssetsQuery.data.map((asset) => (
                      <BazarAssetViewer
                        key={asset.id}
                        asset={asset}
                        selectedAssets={selectedAssets}
                        isEditing={true}
                        toggleAssetSelection={toggleAssetSelection}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">
                      No assets found in this collection
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedCollection && (
                <div className="space-y-4">
                  <div className="relative">
                    {selectedCollection.banner && (
                      <div className="relative h-24 w-full rounded-lg overflow-hidden bg-muted">
                        <img
                          src={`https://arweave.net/${selectedCollection.banner}`}
                          alt="Collection banner"
                          className="w-full h-full object-cover"
                        />
                        <div
                          className="pointer-events-none absolute inset-0 bg-background/60"
                          aria-hidden="true"
                        />
                      </div>
                    )}

                    <div
                      className={`flex items-start gap-3 ${
                        selectedCollection.banner
                          ? "-mt-6 relative z-10 px-3"
                          : ""
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted border-2 border-background">
                        {selectedCollection.thumbnail ? (
                          <img
                            src={`https://arweave.net/${selectedCollection.thumbnail}`}
                            alt={selectedCollection.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <h3 className="text-base font-semibold">
                          {selectedCollection.name || selectedCollection.title}
                        </h3>
                        {selectedCollection.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {selectedCollection.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Assets Display */}
              {selectedAssets.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Featured Assets</h4>
                    <Badge variant="secondary" className="text-xs">
                      {selectedAssets.length} selected
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {selectedAssets.map((assetId) => {
                      const asset = getCollectionAssetsQuery.data?.find(
                        (a) => a.id === assetId
                      );
                      if (!asset) return null;
                      return (
                        <BazarAssetViewer
                          key={asset.id}
                          asset={asset}
                          selectedAssets={selectedAssets}
                          isEditing={false}
                          toggleAssetSelection={() => {}}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium">Floor Price</span>
                  </div>

                  <p className="text-sm font-semibold flex items-center">
                    {formattedPrice}
                    {tokenInfo?.logo ? (
                      <img
                        src={`https://arweave.net/${tokenInfo.logo}`}
                        alt="Token logo"
                        className="w-4 h-4 ml-1"
                      />
                    ) : null}
                  </p>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium">Listed</span>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatPercentage(collectionMetrics?.pl)}
                  </p>
                </div>
              </div>

              {selectedCollection && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{assetCount} assets</span>
                  {createdDate && <span>Created: {createdDate}</span>}
                </div>
              )}

              <div className="pt-2 w-full">
                <div className="flex items-center gap-2 w-full">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      window.open(
                        `https://bazar.arweave.dev/#/collection/${collectionId}`,
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Bazar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BlockForBazarCollection;
