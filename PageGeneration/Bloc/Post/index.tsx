import type { BlockData } from "@/store/useBlockStore";
import { getMediumPost, getParagaphPost } from "./utils";
import getStringFields from "../../utils/getStringFields";
import React from "react";
import ParagraphIcon, { MediumIcon } from "./icon";
type PostSource = "medium" | "paragraph";

type PostPreview = {
  key: string;
  url: string;
  source: PostSource;
  title?: string;
  description?: string;
  imageUrl?: string;
  error?: string;
};

function getHostname(url: string): string | undefined {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function getFaviconUrl(url: string): string | undefined {
  const host = getHostname(url);
  if (!host) return undefined;
  return `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(
    host
  )}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getPath(
  root: unknown,
  path: Array<string | number>
): unknown | undefined {
  let cur: unknown = root;
  for (const key of path) {
    if (typeof key === "number") {
      if (!Array.isArray(cur) || key < 0 || key >= cur.length) return undefined;
      cur = cur[key];
      continue;
    }

    if (!isRecord(cur) || !(key in cur)) return undefined;
    cur = cur[key];
  }
  return cur;
}

function safeString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : undefined;
}

function detectSource(url: string, forced?: PostSource): PostSource {
  if (forced) return forced;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host.includes("paragraph.com")) return "paragraph";
    return "medium";
  } catch {
    return url.includes("paragraph.com") ? "paragraph" : "medium";
  }
}

// function extractMediumPostId(url: string): string | null {
//   try {
//     const u = new URL(url);
//     const seg = u.pathname.split("/").filter(Boolean).pop() ?? "";
//     if (!seg) return null;
//     const last = seg.split("?")[0].split("#")[0];
//     const id = last.includes("-")
//       ? last.slice(last.lastIndexOf("-") + 1)
//       : last;
//     return id.length >= 8 ? id : null;
//   } catch {
//     const match = url.match(/-([a-f0-9]{8,})$/i);
//     return match?.[1] ?? null;
//   }
// }

function extractMediumSlug(url: string): string | undefined {
  try {
    const u = new URL(url);
    const seg = u.pathname.split("/").filter(Boolean).pop() ?? "";
    if (!seg) return undefined;
    return decodeURIComponent(seg);
  } catch {
    return undefined;
  }
}

function extractParagraphSlugs(
  url: string
): { publicationSlug: string; postSlug: string } | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    // expected: /@mypalette/<postSlug>
    const first = parts[0];
    const postSlug = parts.slice(1).join("/");
    if (!first || !first.startsWith("@") || !postSlug) return null;
    return {
      publicationSlug: first.slice(1),
      postSlug,
    };
  } catch {
    return null;
  }
}

function openInNewTab(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";
  a.referrerPolicy = "origin";
  a.click();
}

function getMediumPreviewImageUrl(payload: unknown): string | undefined {
  const imageId = getPath(payload, [
    "value",
    "virtuals",
    "previewImage",
    "imageId",
  ]);
  if (typeof imageId === "string" && imageId.length > 0) {
    // Medium's image CDN format can vary; this one works for common imageIds.
    return `https://miro.medium.com/v2/resize:fit:1200/${imageId}`;
  }
  return undefined;
}

function extractParagraphPreview(data: unknown): {
  title?: string;
  description?: string;
  imageUrl?: string;
} {
  const title =
    safeString(getPath(data, ["title"])) ??
    safeString(getPath(data, ["data", "title"])) ??
    safeString(getPath(data, ["post", "title"])) ??
    safeString(getPath(data, ["data", "post", "title"]));

  const description =
    safeString(getPath(data, ["subtitle"])) ??
    safeString(getPath(data, ["data", "subtitle"])) ??
    safeString(getPath(data, ["post", "subtitle"])) ??
    safeString(getPath(data, ["data", "post", "subtitle"])) ??
    safeString(getPath(data, ["excerpt"])) ??
    safeString(getPath(data, ["data", "excerpt"])) ??
    safeString(getPath(data, ["post", "excerpt"])) ??
    safeString(getPath(data, ["data", "post", "excerpt"]));

  const imageUrl =
    safeString(getPath(data, ["coverImage", "url"])) ??
    safeString(getPath(data, ["data", "coverImage", "url"])) ??
    safeString(getPath(data, ["post", "coverImage", "url"])) ??
    safeString(getPath(data, ["data", "post", "coverImage", "url"])) ??
    safeString(getPath(data, ["imageUrl"])) ??
    safeString(getPath(data, ["data", "imageUrl"])) ??
    safeString(getPath(data, ["post", "imageUrl"])) ??
    safeString(getPath(data, ["data", "post", "imageUrl"]));
  return { title, description, imageUrl };
}
function PostCard({ item }: { item: PostPreview }) {
  const host = getHostname(item.url);
  const faviconUrl = getFaviconUrl(item.url);

  return (
    <div
      className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => openInNewTab(item.url)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") openInNewTab(item.url);
      }}
    >
      {item.imageUrl ? (
        <div className="w-full aspect-video bg-gray-100 overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.title ?? "Post"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-full aspect-video bg-gray-50 flex items-center justify-center">
          <div className="flex items-center gap-3 px-4">
            {faviconUrl ? (
              <img
                src={faviconUrl}
                alt={host ?? "Site"}
                className="w-10 h-10 rounded-lg"
                loading="lazy"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-200" />
            )}
            <div className="min-w-0">
              <div className="text-gray-900 font-semibold truncate">
                {item.title ?? host ?? "Link"}
              </div>
              <div className="text-gray-500 text-xs truncate">{item.url}</div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
            {item.source === "medium" ? (
              <MediumIcon className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ParagraphIcon
                className="w-3.5 h-3.5"
                width={14}
                height={14}
                aria-hidden="true"
              />
            )}
            {item.source === "medium" ? "Medium" : "Paragraph"}
          </span>
        </div>

        {item.title && item.title.length > 0 && (
          <div className="text-gray-900 font-semibold text-lg overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            {item.title ?? host ?? "Link"}
          </div>
        )}
        {item.description ? (
          <p className="text-gray-600 text-sm mt-2 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
            {item.description}
          </p>
        ) : null}

        <p className="text-gray-400 text-xs mt-3 truncate">{item.url}</p>
      </div>
    </div>
  );
}

function Post({ props }: { props: BlockData }) {
  const { description, url } = getStringFields(props.data, [
    "description",
    "url",
  ]);

  // New data shape: single `url` field.
  // Back-compat: if an older `urls` array exists, include those too.
  const rawUrls = (props.data as { urls?: unknown })?.urls;
  const normalized = React.useMemo(() => {
    const single = safeString(url);
    const legacy = (Array.isArray(rawUrls) ? rawUrls : [])
      .filter((u): u is string => typeof u === "string")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const merged = [single, ...legacy].filter((u): u is string => !!u);
    return Array.from(new Set(merged));
  }, [url, rawUrls]);

  const forcedAlt = React.useMemo(() => {
    const _alt = safeString(props.alt);
    if (_alt === "Medium-Post") return "medium" as const;
    if (_alt === "Paragraph-Post") return "paragraph" as const;
    return undefined;
  }, [props.alt]);

  const [items, setItems] = React.useState<PostPreview[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const initial = normalized.map((url, idx) => ({
        key: `${url}-${idx}`,
        url,
        source: detectSource(url, forcedAlt),
      }));

      if (!cancelled) setItems(initial);

      const next = await Promise.all(
        initial.map(async (it) => {
          try {
            if (it.source === "medium") {
              const postId = extractMediumSlug(it.url);
              if (!postId) {
                return {
                  ...it,
                  error: "Could not parse Medium post id",
                };
              }

              try {
                const payload = await getMediumPost(postId);
                const t = safeString(payload.value.title);
                const desc =
                  safeString(payload.value.content?.subtitle) ??
                  safeString(payload.value.virtuals?.subtitle);
                const img = getMediumPreviewImageUrl(payload);

                return {
                  ...it,
                  title: t,
                  description: desc,
                  imageUrl: img,
                };
              } catch {
                // Medium frequently blocks client-side requests (401/403/CORS).
                // Fallback: render a clean link card without treating it as an error.
                return {
                  ...it,
                  title: extractMediumSlug(it.url) ?? getHostname(it.url),
                  description: undefined,
                  imageUrl: undefined,
                  error: undefined,
                };
              }
            }

            const slugs = extractParagraphSlugs(it.url);
            if (!slugs) {
              return {
                ...it,
                error: "Could not parse Paragraph slugs",
              };
            }

            const data = await getParagaphPost(
              slugs.publicationSlug,
              slugs.postSlug
            );
            const { title, description, imageUrl } = extractParagraphPreview(
              data as unknown
            );
            return {
              ...it,
              title,
              description,
              imageUrl,
            };
          } catch (e) {
            return {
              ...it,
              error:
                e instanceof Error ? e.message : "Failed to load post preview",
            };
          }
        })
      );

      if (!cancelled) setItems(next);
      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [normalized, forcedAlt]);

  return (
    <div className="w-full" data-uuid={props.id} data-desc={description || ""}>
      {normalized.length === 0 ? null : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {items.map((item) => (
            <PostCard key={item.key} item={item} />
          ))}
        </div>
      )}

      {loading && normalized.length > 0 ? (
        <div className="text-gray-500 text-xs mt-3">Loading previews…</div>
      ) : null}
    </div>
  );
}

export default Post;
