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
        className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
        data-uuid={props.id}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <span className="text-lg font-semibold">B</span>
        </div>
        <div className="text-sm font-semibold text-slate-900">
          No Bazar profile selected
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Connect a profile in the editor to show it here.
        </div>
      </div>
    );
  }

  const title = displayName || (username ? `@${username}` : "Bazar Profile");
  const profileUrl = `https://bazar.arweave.dev/#/profile/${profileId}`;

  return (
    <div
      className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
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
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"
              aria-hidden="true"
            />
          </div>
        ) : (
          <div className="h-20 w-full bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100" />
        )}

        <div className="absolute -bottom-10 left-6">
          <div className="h-20 w-20 rounded-full border-4 border-white bg-slate-200 shadow-md overflow-hidden flex items-center justify-center">
            {thumbnail ? (
              <img
                src={`https://arweave.net/${thumbnail}`}
                alt={title}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl font-semibold text-slate-700">
                {toInitials(displayName || username || "Bazar")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-12">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-lg font-semibold text-slate-900 truncate">
              {title}
            </div>
            {username && (
              <div className="text-xs text-slate-500">@{username}</div>
            )}
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
            Decentralized Profile
          </span>
        </div>

        {description && (
          <p className="mt-3 text-sm text-slate-600 line-clamp-3">
            {description}
          </p>
        )}

        {selectedAssets.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Featured Assets
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedAssets.slice(0, 5).map((assetId) => (
                <span
                  key={assetId}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600"
                >
                  {assetId.slice(0, 6)}...{assetId.slice(-4)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            className="flex-1 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            onClick={() => window.open(profileUrl, "_blank")}
          >
            View on Bazar
          </button>
          <button
            className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
