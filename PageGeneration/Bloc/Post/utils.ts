interface ParagraphApiError {
  msg?: string;
  error?: string;
  [key: string]: unknown;
}

interface MediumPostPayload {
  value: {
    id: string;
    title: string;
    content?: {
      subtitle?: string;
      bodyModel?: {
        paragraphs: Array<{
          name?: string;
          type?: number;
          text?: string;
          [key: string]: unknown;
        }>;
        sections: Array<{
          startIndex?: number;
          [key: string]: unknown;
        }>;
      };
      [key: string]: unknown;
    };
    virtuals?: {
      readingTime?: number;
      subtitle?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface MediumSuccessResponse {
  success: true;
  payload: MediumPostPayload;
  v: number;
  b: string;
}

interface MediumErrorResponse {
  success: false;
  error: string;
  v: number;
  b: string;
  errorInfo?: {
    code?: number;
    [key: string]: unknown;
  };
}

type MediumPostResponse = MediumSuccessResponse | MediumErrorResponse;

export async function getParagaphPost(
  publicationSlug: string,
  postSlug: string,
) {
  const url = `https://public.api.paragraph.com/api/v1/publications/slug/${encodeURIComponent(
    publicationSlug,
  )}/posts/slug/${encodeURIComponent(postSlug)}?includeContent=true`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
  });
  let data: ParagraphApiError | null = null;

  try {
    data = await response.json();
    console.log("Paragraph API response data:", data);
  } catch {
    //
  }

  if (!response.ok) {
    const message =
      (data && (data.msg || data.error)) ||
      `Paragraph API request failed with status ${response.status}`;

    const error = new Error(message) as Error & {
      status?: number;
      details?: unknown;
    };
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

// Backwards/forwards compatible spelling.
export const getParagraphPost = getParagaphPost;

interface MediumPostError extends Error {
  details: MediumPostResponse;
}

interface Rss2JsonItem {
  title?: string;
  description?: string;
  content?: string;
  link?: string;
  thumbnail?: string;
  enclosure?: {
    link?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface Rss2JsonResponse {
  status?: string;
  feed?: {
    url?: string;
    [key: string]: unknown;
  };
  items?: Rss2JsonItem[];
  [key: string]: unknown;
}

export async function getMediumPost(postSlug: string) {
  const url = `https://medium.com/_/api/posts/${postSlug}`;
  const res = await fetch(url);

  const raw = await res.text();

  // Remove XSSI guard
  const firstBrace = raw.indexOf("{");
  if (firstBrace === -1) {
    throw new Error("Unexpected Medium response format");
  }

  const jsonStr = raw.slice(firstBrace);
  const data = JSON.parse(jsonStr) as MediumPostResponse;

  if (!data.success) {
    const err: MediumPostError = Object.assign(
      new Error(data.error || "Medium post fetch failed"),
      { details: data },
    );
    throw err;
  }

  return data.payload;
}

function normalizePath(path: string): string {
  return path.replace(/\/+$/, "").toLowerCase();
}

function stripHtml(input?: string): string | undefined {
  if (!input) return undefined;
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractFirstImageUrlFromHtml(input?: string): string | undefined {
  if (!input) return undefined;

  const regex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null = regex.exec(input);

  while (match) {
    const src = decodeHtmlEntities(match[1]?.trim() ?? "");
    if (
      src &&
      /^https?:\/\//i.test(src) &&
      !/medium\.com\/_\/stat/i.test(src)
    ) {
      return src;
    }
    match = regex.exec(input);
  }

  return undefined;
}

export async function getMediumPostFromRss(postUrl: string) {
  const parsed = new URL(postUrl);
  const pathParts = parsed.pathname.split("/").filter(Boolean);
  if (pathParts.length < 2) {
    throw new Error("Invalid Medium post URL");
  }

  const publication = pathParts[0].startsWith("@")
    ? pathParts[0]
    : pathParts[0].toLowerCase();
  const feedUrl = `https://medium.com/feed/${publication}`;

  const rssUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
    feedUrl,
  )}`;
  const res = await fetch(rssUrl);
  if (!res.ok) {
    throw new Error(`Failed to load Medium RSS feed (${res.status})`);
  }

  const data = (await res.json()) as Rss2JsonResponse;
  const items = Array.isArray(data.items) ? data.items : [];
  const targetPath = normalizePath(parsed.pathname);

  const match = items.find((item) => {
    if (!item.link) return false;
    try {
      const itemPath = normalizePath(new URL(item.link).pathname);
      return itemPath === targetPath;
    } catch {
      return false;
    }
  });

  if (!match) {
    throw new Error("Medium post not found in feed");
  }

  const imageUrl =
    (typeof match.thumbnail === "string" && match.thumbnail) ||
    (typeof match.enclosure?.link === "string" && match.enclosure.link) ||
    extractFirstImageUrlFromHtml(
      typeof match.content === "string" ? match.content : undefined,
    ) ||
    extractFirstImageUrlFromHtml(
      typeof match.description === "string" ? match.description : undefined,
    ) ||
    undefined;

  return {
    title: typeof match.title === "string" ? match.title : undefined,
    description: stripHtml(
      typeof match.description === "string" ? match.description : undefined,
    ),
    imageUrl,
  };
}
