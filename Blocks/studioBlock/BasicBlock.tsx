import type React from "react";
import ArNS from "@/assets/Arns";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Upload, Camera, X } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import getProfile, { type Profile } from "@/utils/ao/getProfile";
import { useBlockStore } from "@/store/useBlockStore";

export default function BasicCard() {
  const {
    setBasicData: setData,
    name,
    description,
    coverUrl,
    avatarUrl,
  } = useBlockStore();

  const { refetch, isFetching } = useQuery<Profile>({
    queryKey: ["arnsProfile"],
    queryFn: getProfile,
    enabled: false,
  });
  // Cover change handler - use data/base64 instead of blob URL
  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Revoke any existing blob URL to avoid leaks from previous versions
    if (coverUrl?.startsWith("blob:")) URL.revokeObjectURL(coverUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string | null;
      if (result) {
        // Persist as data URL (base64) to be portable and not dependent on runtime blob URLs
        setData({ coverUrl: result });
      }
    };
    reader.readAsDataURL(file);
  };

  // Avatar change handler
  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (avatarUrl?.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);
    const next = URL.createObjectURL(file);
    setData({ avatarUrl: next });
  };

  // Handle ArNS fetch click
  const handleFetch = async () => {
    const res = await refetch();
    const data = res.data;

    if (!data) {
      toast.error("Failed to fetch ArNS profile.");
      return;
    }

    // Update Zustand store
    setData({
      name: data.Name,
      description: data.Description,
      avatarUrl: data.Logo ? `https://arweave.net/${data.Logo}` : null,
    });

    // Warn if missing fields
    if (!data.Name || !data.Description || !data.Logo) {
      toast.warning("Some profile details are missing on ArNS.");
    } else {
      toast.success("ArNS profile details loaded successfully!");
    }
  };

  const disabled = isFetching;

  return (
    <div className="relative max-w-xl rounded-2xl border border-dashed bg-background/40 p-4 sm:p-6">
      {/* Cover Image pill */}
      <div className="absolute left-4 top-4 z-10 rounded-md bg-black/60 px-3 py-1 backdrop-blur-sm">
        <span className="text-xs font-medium text-white">Cover Image</span>
      </div>

      {/* Cover preview */}
      <div className="relative aspect-[3/1] w-full overflow-hidden rounded-xl bg-muted group/cover">
        <img
          src={coverUrl || "/cover-image-placeholder.png"}
          alt="Cover"
          className="h-full w-full object-cover transition-transform duration-300 group-hover/cover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/cover:opacity-100">
          <div className="flex flex-col items-center gap-2 text-white">
            <Upload className="h-8 w-8" />
            <span className="text-sm font-medium">Change Cover</span>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={onCoverChange}
            className="hidden"
            disabled={disabled}
          />
        </label>
        {coverUrl ? (
          <Button
            variant="secondary"
            size="icon"
            aria-label="Remove cover image"
            onClick={() => {
              if (coverUrl?.startsWith("blob:")) URL.revokeObjectURL(coverUrl);
              setData({ coverUrl: null });
            }}
            className="absolute right-2 top-2 h-8 w-8"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      {/* Avatar overlap */}
      <div className="-mt-10 flex flex-col items-center gap-2 sm:-mt-12">
        <div className="relative group/avatar">
          <Avatar className="h-24 w-24 overflow-hidden bg-muted shadow-xl ring-2 ring-background">
            <AvatarImage
              src={
                avatarUrl ||
                "/placeholder.svg?height=128&width=128&query=profile%20avatar%20placeholder"
              }
              alt="Profile"
              className="h-full w-full object-cover transition-transform duration-300 group-hover/avatar:scale-110"
            />
            <AvatarFallback aria-hidden>ME</AvatarFallback>
          </Avatar>

          <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover/avatar:opacity-100">
            <Camera className="h-8 w-8 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={onAvatarChange}
              className="hidden"
              disabled={disabled}
            />
          </label>

          {avatarUrl ? (
            <Button
              variant="secondary"
              size="icon"
              aria-label="Remove profile image"
              onClick={() => {
                if (avatarUrl?.startsWith("blob:"))
                  URL.revokeObjectURL(avatarUrl);
                setData({ avatarUrl: null });
              }}
              className="absolute -top-2 -right-2 h-8 w-8"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}

          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 transform rounded-md border border-border bg-background px-2 py-1 shadow-sm">
            <span className="text-xs font-medium text-muted-foreground">
              Profile
            </span>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Display Name
          </Label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setData({ name: e.target.value })}
            className="bg-muted/40"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-sm font-medium">
            Bio
          </Label>
          <Textarea
            id="bio"
            placeholder="Tell people about yourself..."
            value={description}
            onChange={(e) => setData({ description: e.target.value })}
            className="min-h-28 bg-muted/40"
            disabled={disabled}
          />
        </div>

        <div className="my-4 border-t border-dashed" />

        <div className="text-center">
          <Button
            size="lg"
            onClick={handleFetch}
            className="w-full bg-[#b51820] text-white hover:bg-[#e3222c]"
            disabled={disabled}
          >
            {isFetching ? (
              <span>Fetching details...</span>
            ) : (
              <>
                <ArNS color="white" />
                Fetch Details from ArNS
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
