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
  postSlug: string
) {
  const url = `https://public.api.paragraph.com/api/v1/publications/slug/${encodeURIComponent(
    publicationSlug
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
      { details: data }
    );
    throw err;
  }

  return data.payload;
}
