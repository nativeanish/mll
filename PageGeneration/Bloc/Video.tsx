import type { BlockData } from "@/store/useBlockStore";
import getStringFields from "../utils/getStringFields";
import React from "react";
import * as OdyseeIcon from "./Icon/Odysee";
import * as TwitchIcon from "./Icon/Twitch";
import * as YoutubeIcon from "./Icon/Youtube";
type VideoProvider = "youtube" | "twitch" | "odysee";

function ProviderMark({ provider }: { provider: VideoProvider }) {
  const label =
    provider === "youtube"
      ? "YouTube"
      : provider === "twitch"
        ? "Twitch"
        : "Odysee";

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFE66D] border-2 border-black px-2 py-1 text-[11px] font-bold text-black shadow-[2px_2px_0px_#000]">
      <span className="h-4 w-4 shrink-0 [&_svg]:h-full [&_svg]:w-full">
        {provider === "youtube" ? (
          <YoutubeIcon.default width={16} height={16} />
        ) : provider === "twitch" ? (
          <TwitchIcon.default />
        ) : (
          <OdyseeIcon.default />
        )}
      </span>
      {label}
    </span>
  );
}

function safeParseUrl(raw: string): URL | null {
  if (!raw) return null;
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

function getHostname(raw: string): string {
  const u = safeParseUrl(raw);
  if (u) return u.hostname.replace(/^www\./, "").toLowerCase();
  return "";
}

function extractYouTubeId(raw: string): string | null {
  const u = safeParseUrl(raw);
  if (!u) return null;
  const host = u.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be") {
    const id = u.pathname.replace(/^\//, "").split("/")[0];
    return id || null;
  }

  if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    const path = u.pathname;

    if (path === "/watch") {
      return u.searchParams.get("v") || null;
    }

    const embedMatch = path.match(/^\/embed\/([^/?#]+)/);
    if (embedMatch?.[1]) return embedMatch[1];

    const shortsMatch = path.match(/^\/shorts\/([^/?#]+)/);
    if (shortsMatch?.[1]) return shortsMatch[1];
  }

  return null;
}

function extractTwitchVideoId(raw: string): string | null {
  const u = safeParseUrl(raw);
  if (!u) return null;
  const host = u.hostname.replace(/^www\./, "").toLowerCase();
  if (!host.endsWith("twitch.tv")) return null;

  const match = u.pathname.match(/\/videos\/(\d+)/);
  return match?.[1] ?? null;
}

function getOdyseePath(raw: string): { path: string; r?: string } | null {
  const u = safeParseUrl(raw);
  if (!u) return null;
  const host = u.hostname.replace(/^www\./, "").toLowerCase();
  if (!host.endsWith("odysee.com")) return null;

  const path = u.pathname.replace(/^\//, "");
  if (!path) return null;
  const r = u.searchParams.get("r") ?? undefined;
  return { path, r };
}

function buildEmbed(
  rawUrl: string,
  twitchParent: string,
): { provider: VideoProvider; embedUrl: string; title: string } | null {
  const hostname = getHostname(rawUrl);
  if (!hostname) return null;

  const ytId = extractYouTubeId(rawUrl);
  if (ytId) {
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?rel=0`,
      title: "YouTube video",
    };
  }

  const twitchId = extractTwitchVideoId(rawUrl);
  if (twitchId) {
    const parent = twitchParent || "localhost";
    return {
      provider: "twitch",
      embedUrl: `https://player.twitch.tv/?video=${twitchId}&parent=${encodeURIComponent(
        parent,
      )}&autoplay=false`,
      title: "Twitch video",
    };
  }

  if (hostname.endsWith("odysee.com")) {
    const info = getOdyseePath(rawUrl);
    if (info) {
      const base = `https://odysee.com/$/embed/${encodeURIComponent(info.path)}`;
      const suffix = info.r ? `?r=${encodeURIComponent(info.r)}` : "";
      return {
        provider: "odysee",
        embedUrl: base + suffix,
        title: "Odysee video",
      };
    }
  }

  return null;
}

function LinkIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-link"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function Video({ props }: { props: BlockData }) {
  const { url, description } = getStringFields(props.data, [
    "url",
    "description",
  ]);

  const twitchParent =
    typeof window !== "undefined"
      ? window.location.hostname || "localhost"
      : "localhost";
  const normalizedUrl = (typeof url === "string" ? url.trim() : "") || "";
  const displayUrl = React.useMemo(() => {
    const u = safeParseUrl(normalizedUrl);
    if (!u) return normalizedUrl;
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname && u.pathname !== "/" ? u.pathname : "";
    return `${host}${path}`;
  }, [normalizedUrl]);
  const embed = React.useMemo(
    () => (normalizedUrl ? buildEmbed(normalizedUrl, twitchParent) : null),
    [normalizedUrl, twitchParent],
  );

  return (
    <div
      className="w-full"
      data-uuid={props.id}
      data-description={description || undefined}
    >
      <div
        className="rounded-lg border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] overflow-hidden"
        data-uuid={props.id}
        data-description={description || undefined}
      >
        {embed ? (
          <div className="relative">
            <div className="aspect-video w-full bg-black">
              <iframe
                className="w-full h-full"
                src={embed.embedUrl}
                title={embed.title}
                frameBorder={0}
                loading="lazy"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                allow={
                  embed.provider === "youtube"
                    ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    : embed.provider === "twitch"
                      ? "autoplay; fullscreen"
                      : "fullscreen"
                }
              />
            </div>

            <div className="absolute left-3 top-3">
              <ProviderMark provider={embed.provider} />
            </div>
          </div>
        ) : (
          <div className="px-4 pb-4 pt-3">
            <div className="rounded-lg border-[3px] border-dashed border-black bg-[#FFE66D] p-3 text-sm text-black font-bold">
              Unsupported or invalid video URL.
            </div>
          </div>
        )}

        {normalizedUrl ? (
          <div className="px-4 py-3 border-t-[3px] border-black flex items-center gap-3">
            <a
              href={normalizedUrl}
              target="_blank"
              rel="noopener"
              referrerPolicy="origin"
              className="min-w-0 flex-1 text-xs text-black/60 truncate hover:text-black"
              title={normalizedUrl}
            >
              {displayUrl || normalizedUrl}
            </a>
            <a
              href={normalizedUrl}
              target="_blank"
              rel="noopener"
              referrerPolicy="origin"
              className="shrink-0 inline-flex items-center gap-2 rounded-lg border-[3px] border-black bg-black px-3 py-2 text-xs font-bold uppercase text-white shadow-[3px_3px_0px_#000] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_#000]"
            >
              <LinkIcon size={16} />
              Open
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Video;
