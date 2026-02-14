import type { BlockData } from "@/store/useBlockStore";
import { getStringField } from "../utils/getStringFields";
import React, { useEffect, useState } from "react";

// ─── Custom SVG Icons ────────────────────────────────────────────

function RedditIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 640"
      className={className}
      style={style}
      fill="currentColor"
    >
      <path d="M64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576L101.1 576C87.4 576 80.6 559.5 90.2 549.8L139 501C92.7 454.7 64 390.7 64 320zM413.6 217.6C437.2 217.6 456.3 198.5 456.3 174.9C456.3 151.3 437.2 132.2 413.6 132.2C393 132.2 375.8 146.8 371.8 166.2C337.3 169.9 310.4 199.2 310.4 234.6L310.4 234.8C272.9 236.4 238.6 247.1 211.4 263.9C201.3 256.1 188.6 251.4 174.9 251.4C141.9 251.4 115.1 278.2 115.1 311.2C115.1 335.2 129.2 355.8 149.5 365.3C151.5 434.7 227.1 490.5 320.1 490.5C413.1 490.5 488.8 434.6 490.7 365.2C510.9 355.6 524.8 335 524.8 311.2C524.8 278.2 498 251.4 465 251.4C451.3 251.4 438.7 256 428.6 263.8C401.2 246.8 366.5 236.1 328.6 234.7L328.6 234.5C328.6 209.1 347.5 188 372 184.6C376.4 203.4 393.3 217.4 413.5 217.4L413.6 217.6zM241.1 310.9C257.8 310.9 270.6 328.5 269.6 350.2C268.6 371.9 256.1 379.8 239.3 379.8C222.5 379.8 207.9 371 208.9 349.3C209.9 327.6 224.3 311 241 311L241.1 310.9zM431.2 349.2C432.2 370.9 417.5 379.7 400.8 379.7C384.1 379.7 371.5 371.8 370.5 350.1C369.5 328.4 382.3 310.8 399 310.8C415.7 310.8 430.2 327.4 431.1 349.1L431.2 349.2zM383.1 405.9C372.8 430.5 348.5 447.8 320.1 447.8C291.7 447.8 267.4 430.5 257.1 405.9C255.9 403 257.9 399.7 261 399.4C279.4 397.5 299.3 396.5 320.1 396.5C340.9 396.5 360.8 397.5 379.2 399.4C382.3 399.7 384.3 403 383.1 405.9z" />
    </svg>
  );
}

function FarcasterIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      fill="currentColor"
    >
      <title>Farcaster</title>
      <path d="M18.24.24H5.76C2.5789.24 0 2.8188 0 6v12c0 3.1811 2.5789 5.76 5.76 5.76h12.48c3.1812 0 5.76-2.5789 5.76-5.76V6C24 2.8188 21.4212.24 18.24.24m.8155 17.1662v.504c.2868-.0256.5458.1905.5439.479v.5688h-5.1437v-.5688c-.0019-.2885.2576-.5047.5443-.479v-.504c0-.22.1525-.402.358-.458l-.0095-4.3645c-.1589-1.7366-1.6402-3.0979-3.4435-3.0979-1.8038 0-3.2846 1.3613-3.4435 3.0979l-.0096 4.3578c.2276.0424.5318.2083.5395.4648v.504c.2863-.0256.5457.1905.5438.479v.5688H4.3915v-.5688c-.0019-.2885.2575-.5047.5438-.479v-.504c0-.2529.2011-.4548.4536-.4724v-7.895h-.4905L4.2898 7.008l2.6405-.0005V5.0419h9.9495v1.9656h2.8219l-.6091 2.0314h-.4901v7.8949c.2519.0177.453.2195.453.4724" />
    </svg>
  );
}

function BlueskyIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      viewBox="0 0 640 640"
      fill="currentColor"
    >
      <path d="M439.8 358.7C436.5 358.3 433.1 357.9 429.8 357.4C433.2 357.8 436.5 358.3 439.8 358.7zM320 291.1C293.9 240.4 222.9 145.9 156.9 99.3C93.6 54.6 69.5 62.3 53.6 69.5C35.3 77.8 32 105.9 32 122.4C32 138.9 41.1 258 47 277.9C66.5 343.6 136.1 365.8 200.2 358.6C203.5 358.1 206.8 357.7 210.2 357.2C206.9 357.7 203.6 358.2 200.2 358.6C106.3 372.6 22.9 406.8 132.3 528.5C252.6 653.1 297.1 501.8 320 425.1C342.9 501.8 369.2 647.6 505.6 528.5C608 425.1 533.7 372.5 439.8 358.6C436.5 358.2 433.1 357.8 429.8 357.3C433.2 357.7 436.5 358.2 439.8 358.6C503.9 365.7 573.4 343.5 593 277.9C598.9 258 608 139 608 122.4C608 105.8 604.7 77.7 586.4 69.5C570.6 62.4 546.4 54.6 483.2 99.3C417.1 145.9 346.1 240.4 320 291.1z" />
    </svg>
  );
}

function TwitterIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// ─── Types ───────────────────────────────────────────────────────

type Platform = "reddit" | "farcaster" | "bluesky" | "twitter";

interface PostInfo {
  author: string;
  handle: string;
  avatar?: string;
  content: string;
  title?: string;
  timestamp?: string;
  images: string[];
  videos: string[];
  externalLinks: { url: string; title?: string }[];
  likes: number;
  reposts: number;
  replies: number;
  subreddit?: string;
  channel?: string;
  channelImg?: string;
  url: string;
}

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: PostInfo }
  | { status: "error"; message: string }
  | { status: "embed" }; // For iframe-based platforms (Twitter, Reddit)

// ─── Platform Config ─────────────────────────────────────────────

const PLATFORM_CONFIG: Record<
  Platform,
  {
    name: string;
    color: string;
    bgColor: string;
    hoverColor: string;
    icon: React.ComponentType<{
      className?: string;
      style?: React.CSSProperties;
    }>;
  }
> = {
  reddit: {
    name: "Reddit",
    color: "#FF4500",
    bgColor: "#FFF4F0",
    hoverColor: "#E03D00",
    icon: RedditIcon,
  },
  farcaster: {
    name: "Farcaster",
    color: "#8A63D2",
    bgColor: "#F5F0FF",
    hoverColor: "#7350B8",
    icon: FarcasterIcon,
  },
  bluesky: {
    name: "Bluesky",
    color: "#0085FF",
    bgColor: "#F0F7FF",
    hoverColor: "#006FD6",
    icon: BlueskyIcon,
  },
  twitter: {
    name: "X",
    color: "#000000",
    bgColor: "#F5F5F5",
    hoverColor: "#333333",
    icon: TwitterIcon,
  },
};

// ─── Utilities ───────────────────────────────────────────────────

function detectPlatform(alt?: string): Platform {
  if (alt === "Reddit-Post") return "reddit";
  if (alt === "Farcaster-Post") return "farcaster";
  if (alt === "Twitter-Post") return "twitter";
  return "bluesky";
}

function formatRelativeTime(dateStr: string): string {
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.max(0, Date.now() - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(days / 365)}y`;
}

function formatCount(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function truncateText(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

function openUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

// ─── URL Parsers ─────────────────────────────────────────────────

function parseTweetUrl(url: string): { tweetId: string } | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^(www|mobile)\./, "").toLowerCase();
    if (host !== "twitter.com" && host !== "x.com") return null;
    const match = u.pathname.match(/\/(?:[^/]+)\/status\/(\d+)/);
    return match ? { tweetId: match[1] } : null;
  } catch {
    // Try bare regex
    const match = url.match(/\/status\/(\d+)/);
    return match ? { tweetId: match[1] } : null;
  }
}

function parseBlueskyUrl(url: string): { handle: string; rkey: string } | null {
  try {
    const m = new URL(url).pathname.match(/\/profile\/([^/]+)\/post\/([^/]+)/);
    return m ? { handle: m[1], rkey: m[2] } : null;
  } catch {
    return null;
  }
}

function parseRedditUrl(url: string): { jsonPath: string } | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^(www|old|np|new)\./, "");
    if (!host.includes("reddit.com") && !host.includes("redd.it")) return null;

    // redd.it short URL
    if (host === "redd.it") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? { jsonPath: `/comments/${id}` } : null;
    }

    const match = u.pathname.match(/\/r\/[^/]+\/comments\/[^/]+/);
    return match ? { jsonPath: match[0] } : null;
  } catch {
    return null;
  }
}

function parseFarcasterUrl(
  url: string,
): { username: string; hash: string } | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    // Support warpcast.com, farcaster.tv, and farcaster.xyz
    const validHosts = ["warpcast.com", "farcaster.tv", "farcaster.xyz"];
    if (!validHosts.some((h) => host.includes(h))) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    return parts.length >= 2 ? { username: parts[0], hash: parts[1] } : null;
  } catch {
    return null;
  }
}

// ─── API Fetchers ────────────────────────────────────────────────

async function fetchBlueskyPost(
  handle: string,
  rkey: string,
  url: string,
): Promise<PostInfo> {
  // 1. Resolve handle → DID
  const resolveRes = await fetch(
    `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`,
  );
  if (!resolveRes.ok) throw new Error(`Could not resolve handle @${handle}`);
  const { did } = await resolveRes.json();

  // 2. Fetch post thread
  const uri = `at://${did}/app.bsky.feed.post/${rkey}`;
  const threadRes = await fetch(
    `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(uri)}&depth=0`,
  );
  if (!threadRes.ok) {
    throw new Error(
      threadRes.status === 404
        ? "Post not found or has been deleted"
        : `Bluesky API error (${threadRes.status})`,
    );
  }

  const data = await threadRes.json();
  const post = data?.thread?.post;
  if (!post) throw new Error("Post not found or has been deleted");

  const record = post.record ?? {};
  const author = post.author ?? {};

  // Extract images & videos
  const images: string[] = [];
  const videos: string[] = [];
  const externalLinks: { url: string; title?: string }[] = [];

  function extractBlueskyMedia(embed: Record<string, unknown> | undefined) {
    if (!embed) return;
    const type = embed.$type as string | undefined;

    // Images
    if (type === "app.bsky.embed.images#view") {
      (embed.images as { thumb?: string; fullsize?: string }[])?.forEach(
        (img) => {
          if (img.fullsize) images.push(img.fullsize);
          else if (img.thumb) images.push(img.thumb);
        },
      );
    }

    // Video
    if (type === "app.bsky.embed.video#view") {
      const playlist = (embed as { playlist?: string }).playlist;
      const thumbnail = (embed as { thumbnail?: string }).thumbnail;
      if (playlist) videos.push(playlist);
      else if (thumbnail) images.push(thumbnail);
    }

    // External link with thumbnail
    if (type === "app.bsky.embed.external#view") {
      const ext = (
        embed as { external?: { uri?: string; title?: string; thumb?: string } }
      ).external;
      if (ext?.uri) externalLinks.push({ url: ext.uri, title: ext.title });
      if (ext?.thumb) images.push(ext.thumb);
    }

    // Record with media (quote + media)
    if (type === "app.bsky.embed.recordWithMedia#view") {
      extractBlueskyMedia(embed.media as Record<string, unknown> | undefined);
    }
  }

  extractBlueskyMedia(post.embed);

  return {
    author: author.displayName || handle,
    handle: `@${author.handle || handle}`,
    avatar: author.avatar,
    content: record.text || "",
    timestamp: record.createdAt,
    likes: post.likeCount ?? 0,
    reposts: post.repostCount ?? 0,
    replies: post.replyCount ?? 0,
    images,
    videos,
    externalLinks,
    url,
  };
}

async function fetchRedditPost(
  jsonPath: string,
  _originalUrl: string,
  url: string,
): Promise<PostInfo> {
  // Try fetching via Reddit's JSON API
  // Use a CORS-friendly approach: fetch from the URL with .json suffix
  const jsonUrl = `https://www.reddit.com${jsonPath.replace(/\/$/, "")}.json?raw_json=1`;
  const res = await fetch(jsonUrl, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(
      res.status === 0
        ? "CORS"
        : res.status === 404
          ? "Post not found or has been deleted"
          : res.status === 429
            ? "Reddit rate limit reached — try again shortly"
            : `Reddit API error (${res.status})`,
    );
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("json")) throw new Error("Unexpected response from Reddit");

  const json = await res.json();
  const post = json?.[0]?.data?.children?.[0]?.data;
  if (!post) throw new Error("Post not found or has been deleted");

  const images: string[] = [];
  const videos: string[] = [];
  const externalLinks: { url: string; title?: string }[] = [];

  // Images from preview
  if (post.preview?.images?.[0]?.source?.url) {
    images.push(post.preview.images[0].source.url.replace(/&amp;/g, "&"));
  }

  // Reddit-hosted video
  if (post.is_video && post.media?.reddit_video?.fallback_url) {
    videos.push(post.media.reddit_video.fallback_url.replace(/&amp;/g, "&"));
  }

  // External video (YouTube, etc.)
  if (!post.is_video && post.media?.oembed?.thumbnail_url) {
    images.push(post.media.oembed.thumbnail_url.replace(/&amp;/g, "&"));
  }
  if (
    post.url_overridden_by_dest &&
    /\.(mp4|webm|mov)$/i.test(post.url_overridden_by_dest)
  ) {
    videos.push(post.url_overridden_by_dest);
  }

  // Gallery images
  if (post.gallery_data?.items && post.media_metadata) {
    for (const item of post.gallery_data.items) {
      const meta = post.media_metadata[item.media_id];
      if (meta?.s?.u) images.push(meta.s.u.replace(/&amp;/g, "&"));
    }
  }

  return {
    author: post.author || "[deleted]",
    handle: `u/${post.author || "[deleted]"}`,
    content: post.selftext || "",
    title: post.title,
    timestamp: post.created_utc
      ? new Date(post.created_utc * 1000).toISOString()
      : undefined,
    likes: post.ups ?? 0,
    reposts: 0,
    replies: post.num_comments ?? 0,
    images,
    videos,
    externalLinks,
    subreddit: post.subreddit_name_prefixed || `r/${post.subreddit}`,
    url,
  };
}

async function fetchFarcasterCast(
  username: string,
  hash: string,
  url: string,
): Promise<PostInfo> {
  console.log(
    `Fetching Farcaster cast for username=${username} hash=${hash}...`,
  );
  // Use farcaster.tv endpoint: https://farcaster.tv/{username}/{hash}
  const farcasterTvUrl = `https://farcaster.tv/${encodeURIComponent(username)}/${encodeURIComponent(hash)}`;
  const res = await fetch(farcasterTvUrl);
  console.log(`Fetching Farcaster cast from ${farcasterTvUrl}...`, res);
  if (!res.ok)
    throw new Error(
      res.status === 404
        ? "Cast not found or has been deleted"
        : `Farcaster API error (${res.status})`,
    );

  const data = await res.json();
  const cast = data?.result?.casts?.[0];
  if (!cast) throw new Error("Cast not found or has been deleted");

  const images: string[] = [];
  const videos: string[] = [];
  const externalLinks: { url: string; title?: string }[] = [];

  // Extract media from embeds object
  const embeds = cast.embeds;
  if (embeds) {
    // Images
    if (Array.isArray(embeds.images)) {
      embeds.images.forEach((img: { sourceUrl?: string; url?: string }) => {
        const src = img.sourceUrl || img.url;
        if (src) images.push(src);
      });
    }

    // Videos
    if (Array.isArray(embeds.videos)) {
      embeds.videos.forEach(
        (vid: { sourceUrl?: string; url?: string; type?: string }) => {
          const src = vid.sourceUrl || vid.url;
          if (src) videos.push(src);
        },
      );
    }

    // External URLs
    if (Array.isArray(embeds.urls)) {
      embeds.urls.forEach(
        (link: {
          openGraph?: { url?: string; title?: string; image?: string };
          url?: string;
        }) => {
          const ogUrl = link.openGraph?.url || link.url;
          if (ogUrl) {
            externalLinks.push({
              url: ogUrl,
              title: link.openGraph?.title,
            });
          }
          // Use OpenGraph image as a preview if no images yet
          if (link.openGraph?.image && images.length === 0) {
            images.push(link.openGraph.image);
          }
        },
      );
    }
  }

  // Channel info
  const channel = cast.channel?.name || cast.tags?.[0]?.name;
  const channelImg = cast.channel?.imageUrl || cast.tags?.[0]?.imageUrl;

  return {
    author: cast.author?.displayName || username,
    handle: `@${cast.author?.username || username}`,
    avatar: cast.author?.pfp?.url,
    content: cast.text || embeds?.processedCastText || "",
    timestamp: cast.timestamp
      ? new Date(cast.timestamp).toISOString()
      : undefined,
    likes: cast.reactions?.count ?? 0,
    reposts: (cast.recasts?.count ?? 0) + (cast.quoteCount ?? 0),
    replies: cast.replies?.count ?? 0,
    images,
    videos,
    externalLinks,
    channel,
    channelImg,
    url,
  };
}

// ─── Sub-Components ──────────────────────────────────────────────

/* -------- oEmbed helpers for Twitter (fallback) -------- */

async function fetchTweetOEmbed(tweetUrl: string): Promise<{
  author_name?: string;
  author_url?: string;
  html?: string;
} | null> {
  try {
    const endpoint = `https://publish.twitter.com/oembed?url=${encodeURIComponent(tweetUrl)}&omit_script=true&hide_media=false&hide_thread=true&dnt=true`;
    const res = await fetch(endpoint);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function extractTextFromOEmbed(html: string): string {
  const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (!match) return "";
  return match[1]
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractDateFromOEmbed(html: string): string | undefined {
  const match = html.match(/(\w+ \d{1,2}, \d{4})<\/a>\s*<\/blockquote>/i);
  return match?.[1];
}

function extractUsernameFromUrl(url: string): string | null {
  try {
    const match = new URL(url).pathname.match(/\/([^/]+)\/status\//);
    return match?.[1] ?? null;
  } catch {
    const match = url.match(/\/([^/]+)\/status\//);
    return match?.[1] ?? null;
  }
}

/* -------- FxTwitter API (rich data, CORS-friendly) -------- */

interface RichTweetData {
  text: string;
  authorName: string;
  handle: string;
  avatar: string | null;
  isVerified: boolean;
  timestamp: string | null;
  likes: number;
  replies: number;
  retweets: number;
  images: string[];
  videoThumb: string | null;
  videoUrl: string | null;
  linkCard: {
    title: string;
    description: string;
    image: string | null;
    url: string;
  } | null;
  article: {
    title: string;
    previewText: string;
    coverImage: string | null;
    blocks: { type: string; text: string }[];
  } | null;
}

async function fetchTweetFxTwitter(
  tweetId: string,
): Promise<RichTweetData | null> {
  try {
    const res = await fetch(`https://api.fxtwitter.com/status/${tweetId}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json || json.code !== 200 || !json.tweet) return null;

    const tweet = json.tweet;
    const author = tweet.author ?? {};

    // Extract media
    const allMedia: {
      type: string;
      url: string;
      thumbnail_url?: string;
      width?: number;
      height?: number;
    }[] = tweet.media?.all ?? [];

    // Extract images (photos)
    const images = allMedia.filter((m) => m.type === "photo").map((m) => m.url);

    // Extract video
    let videoThumb: string | null = null;
    let videoUrl: string | null = null;
    const videoMedia = allMedia.find(
      (m) => m.type === "video" || m.type === "animated_gif",
    );
    if (videoMedia) {
      videoThumb = videoMedia.thumbnail_url ?? null;
      videoUrl = videoMedia.url ?? null;
    }

    // Extract external link card (if present)
    let linkCard: RichTweetData["linkCard"] = null;
    const ext = tweet.media?.external;
    if (ext && ext.title) {
      linkCard = {
        title: ext.title,
        description: ext.description ?? "",
        image: ext.thumbnail_url ?? null,
        url: ext.url ?? "",
      };
    }

    // Extract article (if present)
    let article: RichTweetData["article"] = null;
    const rawArticle = tweet.article as
      | {
          title?: string;
          preview_text?: string;
          cover_media?: {
            media_info?: { original_img_url?: string };
          };
          content?: {
            blocks?: { type?: string; text?: string }[];
          };
        }
      | undefined;

    if (rawArticle?.title || rawArticle?.preview_text) {
      const blockItems = (rawArticle.content?.blocks ?? [])
        .map((b) => ({
          type: b.type ?? "unstyled",
          text: (b.text ?? "").trim(),
        }))
        .filter((b) => b.text.length > 0)
        .slice(0, 6);

      article = {
        title: rawArticle.title ?? "Article",
        previewText: rawArticle.preview_text ?? "",
        coverImage:
          rawArticle.cover_media?.media_info?.original_img_url ?? null,
        blocks: blockItems,
      };
    }

    // Format date
    let timestamp: string | null = null;
    if (tweet.created_at) {
      try {
        timestamp = new Date(tweet.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } catch {
        /* ignore */
      }
    }

    return {
      text: tweet.text ?? tweet.raw_text?.text ?? "",
      authorName: author.name ?? "",
      handle: author.screen_name ? `@${author.screen_name}` : "",
      avatar: author.avatar_url ?? null,
      isVerified: author.verified ?? false,
      timestamp,
      likes: tweet.likes ?? 0,
      replies: tweet.replies ?? 0,
      retweets: tweet.retweets ?? 0,
      images,
      videoThumb,
      videoUrl,
      linkCard,
      article,
    };
  } catch {
    return null;
  }
}

/* -------- SVG micro-icons for Twitter card -------- */

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5-6H21m0 0v7.5m0-7.5l-9 9"
      />
    </svg>
  );
}

function VerifiedBadge({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="11" fill="#1D9BF0" />
      <path
        d="M9.5 14.25L6.25 11l-.916.917L9.5 16.083l8.333-8.333-.916-.917L9.5 14.25z"
        fill="#fff"
      />
    </svg>
  );
}

function TweetHeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.56-1.13-1.666-1.84-2.908-1.91z" />
    </svg>
  );
}

function TweetReplyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.25-.893 4.33-2.486 5.86l-4.677 4.49a.697.697 0 01-1.182-.208l-.965-2.5H8.378a2.5 2.5 0 01-2.5-2.5V10H1.75z" />
    </svg>
  );
}

function TweetRetweetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

/* -------- Twitter Custom Card (syndication + oEmbed fallback) -------- */
function TwitterEmbed({ url, tweetId }: { url: string; tweetId: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
  const [rich, setRich] = useState<RichTweetData | null>(null);
  // oEmbed fallback state
  const [fbAuthorName, setFbAuthorName] = useState<string | null>(null);
  const [fbText, setFbText] = useState<string | null>(null);
  const [fbTimestamp, setFbTimestamp] = useState<string | undefined>(undefined);
  const [avatarError, setAvatarError] = useState(false);

  const username = extractUsernameFromUrl(url);
  const xUrl = url.replace(
    /^https?:\/\/(www\.)?(twitter\.com|x\.com)/,
    "https://x.com",
  );

  useEffect(() => {
    let cancelled = false;
    if (!tweetId) {
      setStatus("error");
      return;
    }

    (async () => {
      // Try fxtwitter API first (CORS-friendly, rich data)
      const synData = await fetchTweetFxTwitter(tweetId);
      if (cancelled) return;
      if (synData) {
        setRich(synData);
        setStatus("loaded");
        return;
      }

      // Fallback to oEmbed
      try {
        const oembed = await fetchTweetOEmbed(url);
        if (cancelled) return;
        if (oembed) {
          if (oembed.author_name) setFbAuthorName(oembed.author_name);
          if (oembed.html) {
            setFbText(extractTextFromOEmbed(oembed.html));
            setFbTimestamp(extractDateFromOEmbed(oembed.html));
          }
        }
        setStatus("loaded");
      } catch {
        if (!cancelled) setStatus("loaded");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tweetId, url]);

  // Determine display values (rich > oEmbed fallback)
  const displayName = rich?.authorName || fbAuthorName || username || "User";
  const handle = rich?.handle || (username ? `@${username}` : "");
  const displayText = rich?.text || fbText;
  const displayTimestamp = rich?.timestamp || fbTimestamp;
  const avatarUrl =
    rich?.avatar ||
    (username && !avatarError ? `https://unavatar.io/x/${username}` : null);
  const isVerified = rich?.isVerified ?? false;
  const images = rich?.images ?? [];
  const videoThumb = rich?.videoThumb ?? null;
  const videoUrl = rich?.videoUrl ?? null;
  const linkCard = rich?.linkCard ?? null;
  const article = rich?.article ?? null;
  const likes = rich?.likes ?? 0;
  const replies = rich?.replies ?? 0;
  const retweets = rich?.retweets ?? 0;
  const hasEngagement = likes > 0 || replies > 0 || retweets > 0;

  /* Loading skeleton */
  if (status === "loading") {
    return (
      <div className="w-full rounded-lg border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-black" />
            <div>
              <div className="h-4 w-28 bg-gray-200 rounded mb-1.5" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="w-7 h-7 rounded bg-gray-100" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
          <div className="h-4 w-2/3 bg-gray-100 rounded" />
        </div>
        <div className="h-40 w-full bg-gray-200 rounded-lg border-2 border-black/10 mb-4" />
        <div className="flex items-center gap-6">
          <div className="h-3 w-12 bg-gray-100 rounded" />
          <div className="h-3 w-12 bg-gray-100 rounded" />
          <div className="h-3 w-12 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  /* Error / no tweet ID */
  if (status === "error" || !tweetId) {
    return (
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-lg border-[3px] border-black bg-[#FF6B6B] shadow-[4px_4px_0px_#000] p-5 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all no-underline"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
              <TwitterIcon className="w-5 h-5" style={{ color: "#fff" }} />
            </div>
            <div>
              <p className="text-black font-black text-sm uppercase m-0">
                Could not load tweet
              </p>
              <p className="text-black/60 text-xs font-medium m-0 mt-0.5">
                Tap to view on X
              </p>
            </div>
          </div>
          <ExternalLinkIcon className="w-5 h-5 text-black/60 shrink-0" />
        </div>
      </a>
    );
  }

  /* Loaded card */
  return (
    <div
      className="block w-full rounded-lg border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] overflow-hidden cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all group"
      onClick={() => openUrl(xUrl)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") openUrl(xUrl);
      }}
    >
      {/* Header: Avatar + Name + Verified + X logo */}
      <div className="px-5 pt-5 pb-0 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          {avatarUrl && !avatarError ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-12 h-12 rounded-full border-[3px] border-black object-cover shrink-0"
              loading="lazy"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="w-12 h-12 rounded-full border-[3px] border-black bg-black flex items-center justify-center shrink-0">
              <span className="text-white font-black text-lg">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-black font-bold text-sm truncate m-0 max-w-40">
                {displayName}
              </p>
              {isVerified && <VerifiedBadge className="w-4 h-4 shrink-0" />}
            </div>
            {handle && (
              <p className="text-black/50 text-xs font-medium m-0 truncate">
                {handle}
              </p>
            )}
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shrink-0 group-hover:bg-[#FFE66D] transition-colors">
          <TwitterIcon
            className="w-4 h-4 text-white group-hover:text-black transition-colors"
            style={{}}
          />
        </div>
      </div>

      {/* Tweet text */}
      <div className="px-5 pt-3 pb-3">
        {displayText ? (
          <p className="text-black/80 text-sm leading-relaxed font-medium m-0 whitespace-pre-line overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:6]">
            {displayText}
          </p>
        ) : (
          <p className="text-black/50 text-sm font-medium italic m-0">
            View this post on X →
          </p>
        )}
      </div>

      {/* Media: Images */}
      {images.length > 0 && (
        <div
          className={`mx-5 mb-3 rounded-lg border-[3px] border-black overflow-hidden ${
            images.length === 1 ? "" : "grid grid-cols-2 gap-0"
          }`}
        >
          {images.slice(0, 4).map((img, i) => (
            <div
              key={i}
              className={`relative overflow-hidden ${
                images.length === 1
                  ? "aspect-video"
                  : images.length === 3 && i === 0
                    ? "row-span-2 aspect-square"
                    : "aspect-square"
              } ${images.length > 1 && i > 0 ? "border-l-2 border-black" : ""} ${
                images.length > 2 && i >= 2 ? "border-t-2 border-black" : ""
              } ${images.length === 3 && i === 2 ? "border-t-2 border-black" : ""}`}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {images.length > 4 && i === 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-black text-xl">
                    +{images.length - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Media: Video */}
      {videoThumb && images.length === 0 && (
        <div
          className="mx-5 mb-3 rounded-lg border-[3px] border-black overflow-hidden relative aspect-video bg-black"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              playsInline
              preload="metadata"
              poster={videoThumb}
              className="w-full h-full object-cover bg-black"
            />
          ) : (
            <>
              <img
                src={videoThumb}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/90 border-[3px] border-black shadow-[3px_3px_0px_#000] flex items-center justify-center">
                  <PlayIcon className="w-7 h-7 text-black ml-0.5" />
                </div>
              </div>
            </>
          )}
          <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-[10px] font-bold rounded uppercase pointer-events-none">
            Video
          </span>
        </div>
      )}

      {/* Link card preview */}
      {linkCard && images.length === 0 && !videoThumb && !article && (
        <div className="mx-5 mb-3 rounded-lg border-[3px] border-black overflow-hidden bg-[#FFF8E7]">
          {linkCard.image && (
            <div className="aspect-2/1 overflow-hidden border-b-[3px] border-black">
              <img
                src={linkCard.image}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="px-3 py-2.5">
            <p className="text-black font-bold text-xs truncate m-0">
              {linkCard.title}
            </p>
            {linkCard.description && (
              <p className="text-black/50 text-[11px] font-medium m-0 mt-0.5 line-clamp-2">
                {linkCard.description}
              </p>
            )}
            {linkCard.url && (
              <p className="text-black/40 text-[10px] font-bold m-0 mt-1 truncate uppercase">
                {(() => {
                  try {
                    return new URL(linkCard.url).hostname.replace("www.", "");
                  } catch {
                    return linkCard.url;
                  }
                })()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Article preview */}
      {article && images.length === 0 && !videoThumb && (
        <div className="mx-5 mb-3 rounded-lg border-[3px] border-black overflow-hidden bg-[#FFF8E7]">
          {article.coverImage && (
            <div className="aspect-2/1 overflow-hidden border-b-[3px] border-black">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="px-3 py-3">
            <p className="text-black font-black text-sm leading-snug m-0">
              {article.title}
            </p>
            {article.previewText && (
              <p className="text-black/70 text-xs font-medium m-0 mt-1.5 line-clamp-3">
                {article.previewText}
              </p>
            )}

            {article.blocks.length > 0 && (
              <div className="mt-2.5 space-y-1.5 border-t-2 border-black/15 pt-2.5">
                {article.blocks.map((block, idx) => (
                  <p
                    key={`${block.type}-${idx}`}
                    className={`m-0 text-black/80 font-medium ${
                      block.type === "header-two"
                        ? "text-xs font-black uppercase"
                        : block.type === "ordered-list-item"
                          ? "text-[11px] before:content-['•_']"
                          : "text-[11px]"
                    } line-clamp-2`}
                  >
                    {block.text}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Engagement row */}
      {hasEngagement && (
        <div className="px-5 pb-3 flex items-center gap-5">
          {replies > 0 && (
            <span className="inline-flex items-center gap-1 text-black/40 text-xs font-bold">
              <TweetReplyIcon className="w-3.5 h-3.5" />
              {formatCompact(replies)}
            </span>
          )}
          {retweets > 0 && (
            <span className="inline-flex items-center gap-1 text-black/40 text-xs font-bold">
              <TweetRetweetIcon className="w-3.5 h-3.5" />
              {formatCompact(retweets)}
            </span>
          )}
          {likes > 0 && (
            <span className="inline-flex items-center gap-1 text-[#FF6B6B] text-xs font-bold">
              <TweetHeartIcon className="w-3.5 h-3.5" />
              {formatCompact(likes)}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-3 border-t-[3px] border-black bg-[#FFF8E7] flex items-center justify-between">
        <span className="text-black/50 text-xs font-bold">
          {displayTimestamp ?? "Post on X"}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-black/60 group-hover:text-black transition-colors">
          View on X
          <ExternalLinkIcon className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}

/* -------- Reddit Embed (iframe) -------- */
function RedditEmbed({ url }: { url: string }) {
  const [height, setHeight] = useState(450);
  const [error, setError] = useState(false);

  // Build Reddit embed URL
  const embedUrl = React.useMemo(() => {
    try {
      const u = new URL(url);
      // Normalize to www.reddit.com
      u.hostname = "www.reddit.com";
      // Remove trailing slash and add embed params
      const clean = u.origin + u.pathname.replace(/\/$/, "");
      return `${clean}/?ref=share&ref_source=embed&embed=true&theme=light`;
    } catch {
      return null;
    }
  }, [url]);

  useEffect(() => {
    // Listen for resize messages from Reddit embed
    function handleMessage(e: MessageEvent) {
      if (
        typeof e.data === "object" &&
        e.data?.type === "resize" &&
        typeof e.data.data?.height === "number"
      ) {
        setHeight(Math.min(e.data.data.height, 800));
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!embedUrl || error) {
    return (
      <div className="w-full rounded-lg border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] overflow-hidden">
        <div className="px-5 py-8 flex flex-col items-center text-center">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-lg mb-4 border-2 border-black"
            style={{ backgroundColor: "#FFE66D" }}
          >
            <RedditIcon className="w-7 h-7" style={{ color: "#FF4500" }} />
          </div>
          <p className="text-black font-bold text-sm mb-1">
            Unable to load Reddit post
          </p>
          <p className="text-black/60 text-xs mb-4">
            The post may have been deleted or is unavailable
          </p>
          <button
            onClick={() => openUrl(url)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all uppercase"
            style={{ backgroundColor: "#FF4500" }}
          >
            View on Reddit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] overflow-hidden">
      <iframe
        src={embedUrl}
        sandbox="allow-scripts allow-same-origin allow-popups"
        style={{ width: "100%", height: `${height}px`, border: "none" }}
        scrolling="no"
        loading="lazy"
        title="Reddit post"
        onError={() => setError(true)}
      />
    </div>
  );
}

/* -------- Loading Skeleton -------- */
function LoadingSkeleton({ platform }: { platform: Platform }) {
  const config = PLATFORM_CONFIG[platform];
  const Icon = config.icon;

  return (
    <div className="w-full rounded-lg border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] overflow-hidden">
      <div className="p-4 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-lg bg-gray-200 border-2 border-black" />
          <div className="flex-1">
            <div className="h-4 w-28 bg-gray-200 rounded mb-1.5" />
            <div className="h-3 w-36 bg-gray-100 rounded" />
          </div>
          <Icon
            className="w-5 h-5"
            style={{ color: config.color, opacity: 0.4 }}
          />
        </div>

        {/* Content skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
          <div className="h-4 w-2/3 bg-gray-100 rounded" />
        </div>

        {/* Image skeleton */}
        <div className="w-full h-44 bg-gray-100 rounded-lg mb-3 border-2 border-black" />

        {/* Footer skeleton */}
        <div className="flex gap-6">
          <div className="h-3 w-10 bg-gray-100 rounded" />
          <div className="h-3 w-10 bg-gray-100 rounded" />
          <div className="h-3 w-10 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

/* -------- Error Card -------- */
function ErrorCard({
  platform,
  url,
  message,
  onRetry,
}: {
  platform: Platform;
  url: string;
  message: string;
  onRetry: () => void;
}) {
  const config = PLATFORM_CONFIG[platform];
  const Icon = config.icon;

  return (
    <div className="w-full rounded-lg border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] overflow-hidden">
      <div className="px-5 py-8 flex flex-col items-center text-center">
        {/* Icon badge */}
        <div
          className="flex items-center justify-center w-14 h-14 rounded-lg mb-4 border-2 border-black"
          style={{ backgroundColor: config.bgColor }}
        >
          <Icon className="w-7 h-7" style={{ color: config.color }} />
        </div>

        <p className="text-black font-bold text-sm mb-1">
          Unable to load {config.name} post
        </p>
        <p className="text-black/60 text-xs max-w-xs mb-5 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold border-2 border-black text-black bg-white shadow-[3px_3px_0px_#000] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all uppercase"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Retry
          </button>
          <button
            onClick={() => openUrl(url)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all uppercase"
            style={{ backgroundColor: config.color }}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            View on {config.name}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------- Engagement Icons (inline SVGs to avoid extra imports) -------- */
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function RepostIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
    </svg>
  );
}

/* -------- Post Card -------- */
function PostCard({ data, platform }: { data: PostInfo; platform: Platform }) {
  const config = PLATFORM_CONFIG[platform];
  const Icon = config.icon;
  const timeAgo = data.timestamp ? formatRelativeTime(data.timestamp) : "";

  return (
    <div
      className="w-full rounded-lg border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] overflow-hidden cursor-pointer hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_#000] transition-all duration-200"
      onClick={() => openUrl(data.url)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") openUrl(data.url);
      }}
    >
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {data.avatar ? (
              <img
                src={data.avatar}
                alt={data.author}
                className="w-11 h-11 rounded-lg object-cover shrink-0 border-2 border-black"
                loading="lazy"
              />
            ) : (
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border-2 border-black"
                style={{ backgroundColor: config.bgColor }}
              >
                <Icon className="w-5 h-5" style={{ color: config.color }} />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-black font-bold text-sm truncate max-w-[180px]">
                  {data.author}
                </span>
                {timeAgo && (
                  <span className="text-black/50 text-xs shrink-0 font-bold">
                    · {timeAgo}
                  </span>
                )}
              </div>
              <div className="text-black/60 text-xs truncate font-medium">
                {data.subreddit ?? data.handle}
              </div>
            </div>
          </div>

          {/* Platform badge */}
          <span
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold shrink-0 border-2 border-black uppercase"
            style={{
              backgroundColor: config.bgColor,
              color: config.color,
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            {config.name}
          </span>
        </div>
      </div>

      {/* ── Channel badge (Farcaster) ── */}
      {data.channel && (
        <div className="px-4 pt-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#FFE66D] text-black text-[11px] font-bold border-2 border-black">
            {data.channelImg && (
              <img
                src={data.channelImg}
                alt={data.channel}
                className="w-3.5 h-3.5 rounded-full"
                loading="lazy"
              />
            )}
            /{data.channel}
          </span>
        </div>
      )}

      {/* ── Title (Reddit) ── */}
      {data.title && (
        <div className="px-4 pt-3">
          <h3 className="text-black font-black text-base leading-snug overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
            {data.title}
          </h3>
        </div>
      )}

      {/* ── Content ── */}
      {data.content && (
        <div className="px-4 pt-2">
          <p className="text-black/80 text-sm leading-relaxed whitespace-pre-line overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:6] font-medium">
            {truncateText(data.content, 600)}
          </p>
        </div>
      )}

      {/* ── Videos ── */}
      {data.videos.length > 0 && (
        <div className="px-4 pt-3">
          {data.videos.map((src, i) => (
            <div
              key={`vid-${i}`}
              className="rounded-lg overflow-hidden border-2 border-black mb-2 last:mb-0"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={src}
                controls
                playsInline
                preload="metadata"
                className="w-full max-h-96 bg-black"
                onError={(e) => {
                  (e.target as HTMLVideoElement).style.display = "none";
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Images ── */}
      {data.images.length > 0 && (
        <div className="px-4 pt-3">
          {data.images.length === 1 ? (
            <div className="rounded-lg overflow-hidden border-2 border-black">
              <img
                src={data.images[0]}
                alt="Post media"
                className="w-full max-h-80 object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-0.5 rounded-lg overflow-hidden border-2 border-black">
              {data.images.slice(0, 4).map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Media ${i + 1}`}
                  className="w-full h-40 object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── External Links ── */}
      {data.externalLinks.length > 0 &&
        data.images.length === 0 &&
        data.videos.length === 0 && (
          <div className="px-4 pt-3">
            {data.externalLinks.map((link, i) => (
              <div
                key={`link-${i}`}
                className="flex items-center gap-3 p-3 rounded-lg border-2 border-black bg-[#FFF8E7] hover:bg-[#FFE66D] transition-all mb-2 last:mb-0"
                onClick={(e) => {
                  e.stopPropagation();
                  openUrl(link.url);
                }}
              >
                <svg
                  className="w-4 h-4 text-black shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                <div className="min-w-0">
                  {link.title && (
                    <p className="text-black text-sm font-bold truncate">
                      {link.title}
                    </p>
                  )}
                  <p className="text-black/50 text-xs truncate font-medium">
                    {link.url}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* ── Engagement Footer ── */}
      <div className="px-4 py-3 mt-1">
        <div className="flex items-center gap-5 text-black/60 text-xs font-bold">
          {platform === "reddit" ? (
            <>
              <span className="inline-flex items-center gap-1 hover:text-orange-500 transition-colors">
                <ArrowUpIcon className="w-3.5 h-3.5" />
                {formatCount(data.likes)}
              </span>
              <span className="inline-flex items-center gap-1 hover:text-blue-500 transition-colors">
                <CommentIcon className="w-3.5 h-3.5" />
                {formatCount(data.replies)} comments
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1 hover:text-blue-500 transition-colors">
                <CommentIcon className="w-3.5 h-3.5" />
                {formatCount(data.replies)}
              </span>
              <span className="inline-flex items-center gap-1 hover:text-green-500 transition-colors">
                <RepostIcon className="w-3.5 h-3.5" />
                {formatCount(data.reposts)}
              </span>
              <span className="inline-flex items-center gap-1 hover:text-red-500 transition-colors">
                <HeartIcon className="w-3.5 h-3.5" />
                {formatCount(data.likes)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────

function MediaPost({ props }: { props: BlockData }) {
  const url = (getStringField(props.data, "url") || "").trim();
  const description = getStringField(props.data, "description");
  const platform = detectPlatform(props.alt);
  const [state, setState] = useState<FetchState>({ status: "idle" });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!url) {
        setState({
          status: "error",
          message: "No URL configured for this post",
        });
        return;
      }
      setState({ status: "loading" });
      try {
        let data: PostInfo;

        switch (platform) {
          case "twitter": {
            const parsed = parseTweetUrl(url);
            if (!parsed)
              throw new Error(
                "Invalid Tweet URL. Expected: twitter.com/{user}/status/{id} or x.com/{user}/status/{id}",
              );
            // Twitter uses widget.js embed — no API fetch needed
            if (!cancelled) setState({ status: "embed" });
            return;
          }
          case "reddit": {
            const parsed = parseRedditUrl(url);
            if (!parsed)
              throw new Error(
                "Invalid Reddit URL. Expected: reddit.com/r/{sub}/comments/{id}/...",
              );
            // Try the API first, fall back to embed on CORS error
            try {
              data = await fetchRedditPost(parsed.jsonPath, url, url);
            } catch (apiErr) {
              const msg = apiErr instanceof Error ? apiErr.message : "";
              if (
                msg === "CORS" ||
                msg.includes("Failed to fetch") ||
                msg.includes("NetworkError")
              ) {
                console.log(
                  "[MediaPost] Reddit API blocked by CORS, using iframe embed",
                );
                if (!cancelled) setState({ status: "embed" });
                return;
              }
              throw apiErr;
            }
            break;
          }
          case "bluesky": {
            const parsed = parseBlueskyUrl(url);
            if (!parsed)
              throw new Error(
                "Invalid Bluesky URL. Expected: bsky.app/profile/{handle}/post/{id}",
              );
            data = await fetchBlueskyPost(parsed.handle, parsed.rkey, url);
            break;
          }
          case "farcaster": {
            const parsed = parseFarcasterUrl(url);
            if (!parsed)
              throw new Error(
                "Invalid Farcaster URL. Expected: warpcast.com/{user}/{hash}, farcaster.tv/{user}/{hash}, or farcaster.xyz/{user}/{hash}",
              );
            data = await fetchFarcasterCast(parsed.username, parsed.hash, url);
            break;
          }
          default:
            throw new Error("Unsupported platform");
        }

        console.log(`[MediaPost] ${platform} data received:`, data);
        if (!cancelled) setState({ status: "success", data });
      } catch (err) {
        console.error(`[MediaPost] ${platform} fetch error:`, err);
        if (!cancelled) {
          setState({
            status: "error",
            message: err instanceof Error ? err.message : "Failed to load post",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, platform, retryKey]);

  if (!url) return null;

  return (
    <div className="w-full" data-uuid={props.id} data-desc={description || ""}>
      {state.status === "loading" && <LoadingSkeleton platform={platform} />}
      {state.status === "embed" && platform === "twitter" && (
        <TwitterEmbed url={url} tweetId={parseTweetUrl(url)?.tweetId || ""} />
      )}
      {state.status === "embed" && platform === "reddit" && (
        <RedditEmbed url={url} />
      )}
      {state.status === "error" && (
        <ErrorCard
          platform={platform}
          url={url}
          message={state.message}
          onRetry={() => setRetryKey((k) => k + 1)}
        />
      )}
      {state.status === "success" && (
        <PostCard data={state.data} platform={platform} />
      )}
    </div>
  );
}

export default MediaPost;
