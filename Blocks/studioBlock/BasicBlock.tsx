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
import { Upload, Camera, X, Sparkles } from "lucide-react";
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
    <div className="relative w-full max-w-xl rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      {/* Cover Image Section */}
      <div className="relative">
        {/* Cover pill badge */}
        <div className="absolute left-3 top-3 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-white/90 ring-1 ring-white/10">
            <Upload className="h-3 w-3" />
            Cover Image
          </span>
        </div>

        {/* Cover preview */}
        <div className="relative aspect-3/1 w-full overflow-hidden bg-linear-to-br from-muted via-muted to-muted/50 group/cover">
          <img
            src={coverUrl || "/cover-image-placeholder.png"}
            alt="Cover"
            className="h-full w-full object-cover transition-all duration-500 group-hover/cover:scale-105 group-hover/cover:brightness-90"
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
          <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover/cover:bg-black/40 group-hover/cover:opacity-100">
            <div className="flex flex-col items-center gap-2 text-white transform translate-y-2 group-hover/cover:translate-y-0 transition-transform duration-300">
              <div className="rounded-full bg-white/20 backdrop-blur-sm p-3">
                <Upload className="h-5 w-5" />
              </div>
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
                if (coverUrl?.startsWith("blob:"))
                  URL.revokeObjectURL(coverUrl);
                setData({ coverUrl: null });
              }}
              className="absolute right-2 top-2 h-7 w-7 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 border-0 opacity-0 group-hover/cover:opacity-100 transition-opacity"
              disabled={disabled}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      </div>

      {/* Avatar Section */}
      <div className="-mt-12 flex flex-col items-center gap-1 relative z-10 px-6">
        <div className="relative group/avatar">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 overflow-hidden bg-muted shadow-xl ring-4 ring-card transition-transform duration-300 group-hover/avatar:scale-105">
            <AvatarImage
              src={
                avatarUrl ||
                "/placeholder.svg?height=128&width=128&query=profile%20avatar%20placeholder"
              }
              alt="Profile"
              className="h-full w-full object-cover"
            />
            <AvatarFallback
              className="text-lg font-semibold text-muted-foreground"
              aria-hidden
            >
              ME
            </AvatarFallback>
          </Avatar>

          <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/0 opacity-0 transition-all duration-300 group-hover/avatar:bg-black/50 group-hover/avatar:opacity-100">
            <Camera className="h-6 w-6 text-white" />
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
              className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive/90 text-white hover:bg-destructive border-2 border-card opacity-0 group-hover/avatar:opacity-100 transition-opacity"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          ) : null}
        </div>
        <span className="text-[11px] font-medium text-muted-foreground/70 mt-1">
          Profile Photo
        </span>
      </div>

      {/* Form Fields */}
      <div className="px-5 sm:px-6 pb-6 pt-4 space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="name"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Display Name
          </Label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setData({ name: e.target.value })}
            className="bg-muted/30 border-border/50 rounded-xl h-10 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            disabled={disabled}
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="bio"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Bio
          </Label>
          <Textarea
            id="bio"
            placeholder="Tell people about yourself..."
            value={description}
            onChange={(e) => setData({ description: e.target.value })}
            className="min-h-24 bg-muted/30 border-border/50 rounded-xl text-sm resize-none focus:ring-2 focus:ring-primary/20 transition-all"
            disabled={disabled}
          />
        </div>

        <div className="pt-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-dashed border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground/50 font-medium">
                or import
              </span>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          onClick={handleFetch}
          className="w-full rounded-xl bg-linear-to-r from-red-600 to-rose-500 text-white hover:from-red-700 hover:to-rose-600 shadow-sm hover:shadow-md hover:shadow-red-500/10 transition-all duration-300 h-11 font-medium"
          disabled={disabled}
        >
          {isFetching ? (
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 animate-spin" />
              Fetching details...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ArNS color="white" />
              Fetch Details from ArNS
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
