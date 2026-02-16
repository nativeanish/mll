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
    <div className="relative w-full max-w-xl rounded-lg border-2 border-border bg-card shadow-[4px_4px_0px_var(--border)] overflow-hidden">
      {/* Cover Image Section */}
      <div className="relative">
        <div className="absolute left-3 top-3 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-accent border-2 border-border px-3 py-1 text-[11px] font-black text-accent-foreground uppercase tracking-wide shadow-[2px_2px_0px_var(--border)]">
            <Upload className="h-3 w-3" />
            Cover
          </span>
        </div>

        <div className="relative aspect-3/1 w-full overflow-hidden bg-muted group/cover border-b-2 border-border">
          {coverUrl ? (
            <>
              <img
                src={coverUrl}
                alt="Cover"
                className="h-full w-full object-cover transition-all duration-300 group-hover/cover:scale-105"
              />
              {/* hover overlay: change cover */}
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover/cover:bg-black/40 group-hover/cover:opacity-100">
                <div className="flex flex-col items-center gap-2 text-white">
                  <div className="rounded-lg bg-white/20 p-3 border-2 border-white/40">
                    <Upload className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-black uppercase">
                    Change Cover
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onCoverChange}
                  className="hidden"
                  disabled={disabled}
                />
              </label>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove cover image"
                onClick={() => {
                  if (coverUrl?.startsWith("blob:"))
                    URL.revokeObjectURL(coverUrl);
                  setData({ coverUrl: null });
                }}
                className="absolute right-2 top-2 h-7 w-7 rounded-md bg-destructive text-white border-2 border-border hover:bg-destructive/80 opacity-0 group-hover/cover:opacity-100 transition-opacity shadow-none"
                disabled={disabled}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            /* no cover: always-visible upload prompt */
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-muted transition-colors hover:bg-muted/80">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="rounded-lg bg-muted-foreground/10 p-3 border-2 border-border">
                  <Upload className="h-5 w-5" />
                </div>
                <span className="text-sm font-black uppercase">
                  Upload Cover
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={onCoverChange}
                className="hidden"
                disabled={disabled}
              />
            </label>
          )}
        </div>
      </div>

      {/* Avatar Section */}
      <div className="-mt-12 flex flex-col items-center gap-1 relative z-10 px-6">
        <div className="relative group/avatar">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 overflow-hidden bg-muted border-4 border-border shadow-[3px_3px_0px_var(--border)] ring-4 ring-card">
            <AvatarImage
              src={
                avatarUrl ||
                "/placeholder.svg?height=128&width=128&query=profile%20avatar%20placeholder"
              }
              alt="Profile"
              className="h-full w-full object-cover"
            />
            <AvatarFallback
              className="text-lg font-black text-foreground"
              aria-hidden
            >
              ME
            </AvatarFallback>
          </Avatar>

          <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/0 opacity-0 transition-all duration-200 group-hover/avatar:bg-black/50 group-hover/avatar:opacity-100">
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
              variant="ghost"
              size="icon"
              aria-label="Remove profile image"
              onClick={() => {
                if (avatarUrl?.startsWith("blob:"))
                  URL.revokeObjectURL(avatarUrl);
                setData({ avatarUrl: null });
              }}
              className="absolute -top-1 -right-1 h-6 w-6 rounded-md bg-destructive text-white hover:bg-destructive/80 border-2 border-border opacity-0 group-hover/avatar:opacity-100 transition-opacity shadow-none"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          ) : null}
        </div>
        <span className="text-[11px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">
          Profile Photo
        </span>
      </div>

      {/* Form Fields */}
      <div className="px-5 sm:px-6 pb-6 pt-4 space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="name"
            className="text-xs font-black uppercase tracking-widest text-foreground"
          >
            Display Name
          </Label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setData({ name: e.target.value })}
            className="rounded-lg h-10 text-sm"
            disabled={disabled}
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="bio"
            className="text-xs font-black uppercase tracking-widest text-foreground"
          >
            Bio
          </Label>
          <Textarea
            id="bio"
            placeholder="Tell people about yourself..."
            value={description}
            onChange={(e) => setData({ description: e.target.value })}
            className="min-h-24 rounded-lg text-sm resize-none"
            disabled={disabled}
          />
        </div>

        <div className="pt-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t-2 border-dashed border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground font-black uppercase tracking-widest">
                or import
              </span>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          onClick={handleFetch}
          className="w-full rounded-lg bg-destructive text-white border-2 border-border h-11 font-black uppercase tracking-wide shadow-[4px_4px_0px_var(--border)] hover:shadow-[6px_6px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_var(--border)] transition-all"
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
