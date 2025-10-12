import useWallet from "@/store/useWallet";
import { fetchProfilewithAssets } from "@/utils/block/fetchDetails";
import { ImageIcon, LinkIcon, Loader2, Trash2, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/src/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import BazarAssetViewer from "./nftutils/bazarAssetViewer";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/src/components/ui/badge";

interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
}
export interface BazarAsset {
  type: "image" | "video" | "unknown" | "token";
  id: string;
  logoImage: string;
  quantity: string;
}

interface BazarProfile {
  id: string;
  owner: string;
  assets: BazarAsset[];
  version: string;
  description?: string;
  banner?: string;
  username?: string;
  displayName?: string;
  collections: string[];
  thumbnail?: string;
}
function BlockForBazarProfile({ isEdit }: Props) {
  const address = useWallet.getState().address;
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const {
    data: profileData,
    isLoading,
    error,
    isError,
  } = useQuery<BazarProfile | { id: null }>({
    queryKey: ["bazar-profile", address],
    queryFn: () => fetchProfilewithAssets(address || ""),
    enabled: address !== null,
    retry: 1,
  });

  const toggleAssetSelection = (asset: BazarAsset) => {
    setSelectedAssets((prev) => {
      if (prev.includes(asset.id)) {
        return prev.filter((id) => id !== asset.id);
      } else if (prev.length < 5) {
        return [...prev, asset.id];
      } else {
        toast.warning("Maximum 5 assets allowed", {
          description: "You can select up to 5 assets for your profile.",
        });
        return prev;
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center ">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Loading Bazar Profile</p>
            <p className="text-xs text-muted-foreground">
              Fetching profile data from Arweave...
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (
    isError ||
    !profileData ||
    ("id" in profileData && profileData.id === null) ||
    !profileData.id ||
    error
  ) {
    return (
      <div className="flex flex-col items-center justify-center p-2">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
              Bazar Profile Error
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 max-w-sm mx-auto">
              {profileData && "id" in profileData && profileData.id === null
                ? "No Bazar account found for this wallet address"
                : "Failed to load profile data from Arweave"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-8">
          <Button
            variant="destructive"
            size="sm"
            className="bg-red-600 hover:bg-red-700"
            // onClick={() => data?.id && removeBlock(data.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Block
          </Button>
        </div>
      </div>
    );
  }
  const profile = profileData as BazarProfile & {
    assets: Array<{
      type: "image" | "video" | "unknown" | "token";
      id: string;
      logoImage: string;
      quantity: string;
    }>;
  };
  return (
    <div>
      {isEdit ? (
        <div className="space-y-6">
          {/* Profile Preview */}
          <div className="space-y-4">
            <div className="relative">
              {/* Banner */}
              {profile.banner && (
                <div className="relative h-32 w-full rounded-lg overflow-hidden bg-muted">
                  <img
                    src={`https://arweave.net/${profile.banner}`}
                    alt="Profile banner"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-background/60"
                    aria-hidden="true"
                  />
                </div>
              )}

              {/* Profile Info */}
              <div
                className={`flex items-start gap-4 ${profile.banner ? "-mt-8 relative z-10 px-4" : ""}`}
              >
                <Avatar className="h-16 w-16 border-4 border-background">
                  <AvatarImage
                    src={
                      profile.thumbnail
                        ? `https://arweave.net/${profile.thumbnail}`
                        : undefined
                    }
                    alt={profile.displayName || profile.username}
                  />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    {profile.displayName && (
                      <span className="text-lg font-semibold leading-none">
                        {profile.displayName}
                      </span>
                    )}
                    {profile.username && (
                      <span className="text-sm text-muted-foreground">
                        @{profile.username}
                      </span>
                    )}
                  </div>

                  {profile.description && (
                    <p className="text-sm">{profile.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Asset Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">
                  Select Assets to Display
                </h4>
                <p className="text-xs text-muted-foreground">
                  Choose up to 5 assets to showcase ({selectedAssets.length}/5
                  selected)
                </p>
              </div>
            </div>

            {profile.assets && profile.assets.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                {profile.assets.map((asset) => (
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
                <p className="text-sm">No assets found</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="relative">
              {/* Banner */}
              {profile.banner && (
                <div className="relative h-24 w-full rounded-lg overflow-hidden bg-muted">
                  <img
                    src={`https://arweave.net/${profile.banner}`}
                    alt="Profile banner"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-background/80"
                    aria-hidden="true"
                  />
                </div>
              )}

              {/* Profile Info */}
              <div
                className={`flex items-start gap-3 ${profile.banner ? "-mt-6 relative z-10 px-3" : ""}`}
              >
                <Avatar className="h-12 w-12 border-2 border-background">
                  <AvatarImage
                    src={
                      profile.thumbnail
                        ? `https://arweave.net/${profile.thumbnail}`
                        : undefined
                    }
                    alt={profile.displayName || profile.username}
                  />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                  {(profile.displayName || profile.username) && (
                    <div className="flex flex-wrap items-baseline gap-2">
                      {profile.displayName && (
                        <span className="text-base font-semibold leading-none">
                          {profile.displayName}
                        </span>
                      )}
                      {profile.username && (
                        <span className="text-xs text-muted-foreground">
                          @{profile.username}
                        </span>
                      )}
                    </div>
                  )}
                  {profile.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {profile.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{profile.assets?.length || 0} assets</span>
            <span>{profile.collections?.length || 0} collections</span>
          </div>
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
                  const asset = profile.assets.find((a) => a.id === assetId);
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
          <div className="w-full">
            <Button
              variant={"default"}
              size={"lg"}
              className="w-full flex gap-x-2"
              onClick={() => {
                window.open(
                  `https://bazar.arweave.dev/#/profile/${profile.id}`,
                  "_blank"
                );
                toast.success("Opening profile on bazar");
              }}
            >
              <LinkIcon className="w-4 h-4" />
              <span>View on Bazar</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlockForBazarProfile;
