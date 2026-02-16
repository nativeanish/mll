import type { BlockData } from "@/store/useBlockStore";
import getStringFields from "../utils/getStringFields";
import { useState } from "react";

interface BazarCollectionProps {
  props: BlockData;
}

interface AssetData {
  type: "image" | "video" | "unknown" | "token";
  id: string;
  logoImage: string;
  quantity: string;
}

const ASSETS_PER_ROW = 4;

const getStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string") as string[];
};

const getAssetArray = (value: unknown): AssetData[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is AssetData =>
      typeof item === "object" &&
      item !== null &&
      "type" in item &&
      "id" in item,
  );
};

/* ── Asset Modal ─────────────────────────────────────────── */
function AssetModal({
  asset,
  onClose,
}: {
  asset: AssetData;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative w-[90%] max-w-md bg-white border-[3px] border-black rounded-lg shadow-[6px_6px_0px_#000] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          className="absolute top-2 right-2 z-10 h-7 w-7 flex items-center justify-center rounded border-2 border-black bg-white text-black font-black text-sm shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Image */}
        {asset.type === "image" && (
          <div className="w-full">
            <img
              src={`https://arweave.net/${asset.id}`}
              alt={`Asset ${asset.id}`}
              className="w-full max-h-[60vh] object-contain bg-gray-50"
            />
            <div className="p-3 border-t-[3px] border-black flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-black/60 truncate">
                {asset.id}
              </span>
              <button
                className="rounded border-2 border-black bg-black text-white px-3 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                onClick={() =>
                  window.open(
                    `https://bazar.arweave.net/assets/${asset.id}`,
                    "_blank",
                  )
                }
              >
                View on Bazar
              </button>
            </div>
          </div>
        )}

        {/* Video */}
        {asset.type === "video" && (
          <div className="w-full">
            <video
              src={`https://arweave.net/${asset.id}`}
              className="w-full max-h-[60vh] bg-black"
              controls
              autoPlay
              playsInline
            />
            <div className="p-3 border-t-[3px] border-black flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-black/60 truncate">
                {asset.id}
              </span>
              <button
                className="rounded border-2 border-black bg-black text-white px-3 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                onClick={() =>
                  window.open(
                    `https://bazar.arweave.net/assets/${asset.id}`,
                    "_blank",
                  )
                }
              >
                View on Bazar
              </button>
            </div>
          </div>
        )}

        {/* Token */}
        {asset.type === "token" && (
          <div className="p-5 text-center space-y-3">
            {asset.logoImage && (
              <img
                src={`https://arweave.net/${asset.logoImage}`}
                alt="Token"
                className="w-16 h-16 mx-auto object-contain rounded-lg border-2 border-black bg-white p-1 shadow-[2px_2px_0px_#000]"
              />
            )}
            <div className="text-xs font-black uppercase text-black/60 truncate">
              {asset.id}
            </div>
            <button
              className="w-full rounded-lg border-[2.5px] border-black bg-[#4ECDC4] px-4 py-2 text-xs font-black text-black uppercase shadow-[3px_3px_0px_#000] hover:shadow-[1px_1px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              onClick={() =>
                window.open(
                  `https://bazar.arweave.net/assets/${asset.id}`,
                  "_blank",
                )
              }
            >
              Buy Token
            </button>
          </div>
        )}

        {/* Unknown */}
        {asset.type === "unknown" && (
          <div className="p-5 text-center space-y-3">
            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-lg border-2 border-black bg-gray-100 shadow-[2px_2px_0px_#000]">
              <svg
                className="w-6 h-6 text-black/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-sm font-black uppercase text-black">
              Unknown Type
            </div>
            <div className="text-[10px] text-black/50 font-bold truncate">
              {asset.id}
            </div>
            <button
              className="w-full rounded-lg border-[2.5px] border-black bg-gray-200 px-4 py-2 text-xs font-black text-black uppercase shadow-[3px_3px_0px_#000] hover:shadow-[1px_1px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              onClick={() =>
                window.open(
                  `https://bazar.arweave.net/assets/${asset.id}`,
                  "_blank",
                )
              }
            >
              View on Bazar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
function BazarCollection({ props }: BazarCollectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeAsset, setActiveAsset] = useState<AssetData | null>(null);

  const {
    collectionId,
    title,
    description,
    banner,
    thumbnail,
    floorPrice,
    listedPercentage,
    tokenLogo,
    createdDate,
    assetCount,
  } = getStringFields(props.data, [
    "collectionId",
    "title",
    "description",
    "banner",
    "thumbnail",
    "floorPrice",
    "listedPercentage",
    "tokenLogo",
    "createdDate",
    "assetCount",
  ]);

  const selectedAssets = getStringArray(
    (props.data as Record<string, unknown> | undefined)?.selectedAssets,
  );

  const assets = getAssetArray(
    (props.data as Record<string, unknown> | undefined)?.assets,
  );

  const displayAssets =
    selectedAssets.length > 0
      ? assets.filter((a) => selectedAssets.includes(a.id))
      : [];

  const visibleAssets = expanded
    ? displayAssets
    : displayAssets.slice(0, ASSETS_PER_ROW);

  const hasMore = displayAssets.length > ASSETS_PER_ROW;

  if (!collectionId) {
    return (
      <div
        className="w-full rounded-lg border-[3px] border-black bg-[#FF6B6B] p-4 text-center shadow-[4px_4px_0px_#000]"
        data-uuid={props.id}
      >
        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded border-2 border-black bg-white">
          <span className="text-sm font-black text-black">?</span>
        </div>
        <div className="text-xs font-bold text-black uppercase">
          No collection selected
        </div>
      </div>
    );
  }

  const collectionUrl = `https://bazar.arweave.dev/#/collection/${collectionId}`;

  return (
    <div
      className="w-full overflow-hidden rounded-lg border-[3px] border-black bg-white shadow-[5px_5px_0px_#000]"
      data-uuid={props.id}
    >
      {/* Asset Modal */}
      {activeAsset && (
        <AssetModal asset={activeAsset} onClose={() => setActiveAsset(null)} />
      )}

      {/* Banner */}
      <div className="relative">
        {banner ? (
          <div className="h-20 w-full">
            <img
              src={`https://arweave.net/${banner}`}
              alt="Banner"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-14 w-full bg-[#FF6B6B]" />
        )}

        <div className="absolute -bottom-7 left-4">
          <div className="h-14 w-14 rounded-lg border-[3px] border-black bg-gray-200 shadow-[2px_2px_0px_#000] overflow-hidden flex items-center justify-center">
            {thumbnail ? (
              <img
                src={`https://arweave.net/${thumbnail}`}
                alt={title || "Collection"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-base font-black text-black">
                {(title || "C")[0].toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 pt-10">
        {/* Title + date */}
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-sm font-black text-black uppercase truncate">
            {title || "Untitled Collection"}
          </div>
          {createdDate && (
            <span className="shrink-0 text-[9px] font-bold text-black/40 uppercase">
              {createdDate}
            </span>
          )}
        </div>

        {description && (
          <p className="mt-1 text-[11px] text-black/60 line-clamp-2">
            {description}
          </p>
        )}

        {/* Metrics — single row */}
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <div className="rounded border-2 border-black bg-[#4ECDC4] px-2 py-1 text-center shadow-[2px_2px_0px_#000]">
            <div className="text-[8px] font-black text-black/70 uppercase">
              Floor
            </div>
            <div className="text-[11px] font-black text-black flex items-center justify-center gap-0.5">
              {floorPrice || "N/A"}
              {tokenLogo && (
                <img
                  src={`https://arweave.net/${tokenLogo}`}
                  alt=""
                  className="w-3 h-3"
                />
              )}
            </div>
          </div>
          <div className="rounded border-2 border-black bg-[#FFE66D] px-2 py-1 text-center shadow-[2px_2px_0px_#000]">
            <div className="text-[8px] font-black text-black/70 uppercase">
              Listed
            </div>
            <div className="text-[11px] font-black text-black">
              {listedPercentage || "N/A"}
            </div>
          </div>
          <div className="rounded border-2 border-black bg-[#C4B5FD] px-2 py-1 text-center shadow-[2px_2px_0px_#000]">
            <div className="text-[8px] font-black text-black/70 uppercase">
              Assets
            </div>
            <div className="text-[11px] font-black text-black">
              {assetCount || "0"}
            </div>
          </div>
        </div>

        {/* Assets Grid */}
        {displayAssets.length > 0 && (
          <div className="mt-3">
            <div className="grid grid-cols-5 md:grid-cols-8 gap-1.5">
              {visibleAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="aspect-square rounded border-2 border-black overflow-hidden bg-gray-100 shadow-[2px_2px_0px_#000] cursor-pointer transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                  onClick={() => setActiveAsset(asset)}
                >
                  {asset.type === "token" && asset.logoImage && (
                    <img
                      src={`https://arweave.net/${asset.logoImage}`}
                      alt="Token"
                      className="w-full h-full object-contain p-2 bg-white"
                    />
                  )}
                  {asset.type === "image" && (
                    <img
                      src={`https://arweave.net/${asset.id}`}
                      alt="Asset"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {asset.type === "video" && (
                    <video
                      src={`https://arweave.net/${asset.id}`}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  )}
                  {asset.type === "unknown" && (
                    <div className="flex items-center justify-center h-full text-black/30 bg-white">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Expand / Collapse */}
            {hasMore && (
              <button
                className="mt-2 w-full rounded border-2 border-black bg-[#FFE66D] px-3 py-1.5 text-[10px] font-black text-black uppercase tracking-wider shadow-[2px_2px_0px_#000] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-1.5"
                onClick={() => setExpanded(!expanded)}
              >
                <svg
                  className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                {expanded
                  ? "Less"
                  : `+${displayAssets.length - ASSETS_PER_ROW} More`}
              </button>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          className="mt-3 w-full rounded-lg border-[3px] border-black bg-black px-4 py-2 text-xs font-bold text-white uppercase shadow-[3px_3px_0px_#000] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
          onClick={() => window.open(collectionUrl, "_blank")}
        >
          View on Bazar
        </button>
      </div>
    </div>
  );
}

export default BazarCollection;
