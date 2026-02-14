import type { BlockData } from "@/store/useBlockStore";
import getStringFields from "../utils/getStringFields";

interface BazarProfileProps {
  props: BlockData;
}

const getStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string") as string[];
};

const toInitials = (name?: string) => {
  if (!name) return "B";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

function BazarProfile({ props }: BazarProfileProps) {
  const { profileId, displayName, username, description, banner, thumbnail } =
    getStringFields(props.data, [
      "profileId",
      "displayName",
      "username",
      "description",
      "banner",
      "thumbnail",
    ]);

  const selectedAssets = getStringArray(
    (props.data as Record<string, unknown> | undefined)?.selectedAssets,
  );

  if (!profileId) {
    return (
      <div
        className="w-full rounded-lg border-[3px] border-black bg-[#FFE66D] p-6 text-center shadow-[4px_4px_0px_#000]"
        data-uuid={props.id}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white border-[3px] border-black">
          <span className="text-lg font-bold text-black">B</span>
        </div>
        <div className="text-sm font-bold text-black uppercase">
          No Bazar profile selected
        </div>
        <div className="mt-1 text-xs text-black/70">
          Connect a profile in the editor to show it here.
        </div>
      </div>
    );
  }

  const title = displayName || (username ? `@${username}` : "Bazar Profile");
  const profileUrl = `https://bazar.arweave.dev/#/profile/${profileId}`;

  return (
    <div
      className="w-full overflow-hidden rounded-lg border-[3px] border-black bg-white shadow-[6px_6px_0px_#000]"
      data-uuid={props.id}
    >
      <div className="relative">
        {banner ? (
          <div className="h-28 w-full">
            <img
              src={`https://arweave.net/${banner}`}
              alt="Bazar profile banner"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 hidden" aria-hidden="true" />
          </div>
        ) : (
          <div className="h-20 w-full bg-[#4ECDC4]" />
        )}

        <div className="absolute -bottom-10 left-6">
          <div className="h-20 w-20 rounded-lg border-[3px] border-black bg-gray-200 shadow-[3px_3px_0px_#000] overflow-hidden flex items-center justify-center">
            {thumbnail ? (
              <img
                src={`https://arweave.net/${thumbnail}`}
                alt={title}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-black">
                {toInitials(displayName || username || "Bazar")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-12">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-lg font-black text-black uppercase truncate">
              {title}
            </div>
            {username && (
              <div className="text-xs text-black/60 font-bold">@{username}</div>
            )}
          </div>
          <span className="rounded-lg border-[3px] border-black bg-[#4ECDC4] px-2.5 py-1 text-[11px] font-bold text-black uppercase">
            Decentralized Profile
          </span>
        </div>

        {description && (
          <p className="mt-3 text-sm text-black/70 line-clamp-3">
            {description}
          </p>
        )}

        {selectedAssets.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-bold text-black uppercase tracking-widest">
              Featured Assets
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedAssets.slice(0, 5).map((assetId) => (
                <span
                  key={assetId}
                  className="rounded-lg border-2 border-black bg-[#FFE66D] px-2.5 py-1 text-[11px] text-black font-bold"
                >
                  {assetId.slice(0, 6)}...{assetId.slice(-4)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            className="flex-1 rounded-lg border-[3px] border-black bg-black px-4 py-2 text-sm font-bold text-white uppercase shadow-[4px_4px_0px_#000] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
            onClick={() => window.open(profileUrl, "_blank")}
          >
            View on Bazar
          </button>
          <button
            className="flex-1 rounded-lg border-[3px] border-black bg-white px-4 py-2 text-sm font-bold text-black uppercase shadow-[4px_4px_0px_#000] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000]"
            onClick={() => window.open("https://bazar.arweave.dev", "_blank")}
          >
            Explore Marketplace
          </button>
        </div>
      </div>
    </div>
  );
}

export default BazarProfile;
