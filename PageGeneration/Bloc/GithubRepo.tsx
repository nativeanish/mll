import type { BlockData } from "@/store/useBlockStore";

interface GithubRepoProps {
  props: BlockData;
}

interface RepoOwner {
  login?: string;
  avatar_url?: string;
}

interface RepoDetails {
  id: number;
  name?: string;
  full_name?: string;
  html_url?: string;
  description?: string | null;
  owner?: RepoOwner;
  homepage?: string | null;
  language?: string | null;
  stargazers_count?: number;
  watchers_count?: number;
  forks_count?: number;
  open_issues_count?: number;
  default_branch?: string;
  updated_at?: string;
  pushed_at?: string;
  license?: { name?: string } | null;
}

type FieldKey =
  | "owner_avatar"
  | "owner_login"
  | "name"
  | "full_name"
  | "description"
  | "homepage"
  | "language"
  | "stargazers"
  | "watchers"
  | "forks"
  | "open_issues"
  | "default_branch"
  | "license"
  | "updated_at"
  | "pushed_at"
  | "readme_title"
  | "readme_summary"
  | "readme_headings";

const DEFAULT_VISIBLE_FIELDS: Record<FieldKey, boolean> = {
  owner_avatar: true,
  owner_login: true,
  name: true,
  full_name: true,
  description: true,
  homepage: true,
  language: true,
  stargazers: true,
  watchers: true,
  forks: true,
  open_issues: true,
  default_branch: true,
  license: true,
  updated_at: true,
  pushed_at: false,
  readme_title: true,
  readme_summary: true,
  readme_headings: false,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object";

const parseVisibleFields = (value: unknown): Record<FieldKey, boolean> => {
  const fields = { ...DEFAULT_VISIBLE_FIELDS };
  if (!isRecord(value)) return fields;
  (Object.keys(fields) as FieldKey[]).forEach((key) => {
    if (typeof value[key] === "boolean") {
      fields[key] = value[key] as boolean;
    }
  });
  return fields;
};

const getStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string") as string[];
};

const parseRepoData = (value: unknown): RepoDetails | null => {
  if (!isRecord(value) || typeof value.id !== "number") return null;
  return {
    id: value.id,
    name: typeof value.name === "string" ? value.name : undefined,
    full_name:
      typeof value.full_name === "string" ? value.full_name : undefined,
    html_url: typeof value.html_url === "string" ? value.html_url : undefined,
    description:
      typeof value.description === "string" || value.description === null
        ? value.description
        : null,
    owner: isRecord(value.owner)
      ? {
          login:
            typeof value.owner.login === "string"
              ? value.owner.login
              : undefined,
          avatar_url:
            typeof value.owner.avatar_url === "string"
              ? value.owner.avatar_url
              : undefined,
        }
      : undefined,
    homepage:
      typeof value.homepage === "string" || value.homepage === null
        ? value.homepage
        : null,
    language:
      typeof value.language === "string" || value.language === null
        ? value.language
        : null,
    stargazers_count:
      typeof value.stargazers_count === "number"
        ? value.stargazers_count
        : undefined,
    watchers_count:
      typeof value.watchers_count === "number"
        ? value.watchers_count
        : undefined,
    forks_count:
      typeof value.forks_count === "number" ? value.forks_count : undefined,
    open_issues_count:
      typeof value.open_issues_count === "number"
        ? value.open_issues_count
        : undefined,
    default_branch:
      typeof value.default_branch === "string"
        ? value.default_branch
        : undefined,
    updated_at:
      typeof value.updated_at === "string" ? value.updated_at : undefined,
    pushed_at:
      typeof value.pushed_at === "string" ? value.pushed_at : undefined,
    license: isRecord(value.license)
      ? {
          name:
            typeof value.license.name === "string"
              ? value.license.name
              : undefined,
        }
      : null,
  };
};

const toExternalHref = (value: string) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

function GithubRepo({ props }: GithubRepoProps) {
  const data = isRecord(props.data) ? props.data : {};
  const repoData = parseRepoData(data.repoData);
  const readmeRaw = typeof data.readmeRaw === "string" ? data.readmeRaw : "";
  const readmeTitle =
    typeof data.readmeTitle === "string" ? data.readmeTitle : "";
  const readmeSummary =
    typeof data.readmeSummary === "string" ? data.readmeSummary : "";
  const readmeHeadings = getStringArray(data.readmeHeadings);
  const visibleFields = parseVisibleFields(data.visibleFields);

  /* ── empty state ── */
  if (!repoData) {
    return (
      <div
        className="w-full rounded-md border-[2.5px] border-black bg-[#FFE66D] px-4 py-3 text-center shadow-[3px_3px_0px_#000]"
        data-uuid={props.id}
      >
        <span className="text-sm font-extrabold text-black uppercase tracking-wide">
          No repository selected
        </span>
        <p className="text-[11px] text-black/60 mt-0.5">
          Add a repo in the editor to display it here.
        </p>
      </div>
    );
  }

  /* helper: collect visible meta tags */
  const metaTags: { label: string; value: string; color: string }[] = [];

  if (visibleFields.language && repoData.language)
    metaTags.push({
      label: repoData.language,
      value: "",
      color: "bg-[#E0F2FE] text-black",
    });
  if (visibleFields.default_branch && repoData.default_branch)
    metaTags.push({
      label: repoData.default_branch,
      value: "branch",
      color: "bg-[#F3E8FF] text-black",
    });
  if (visibleFields.license && repoData.license?.name)
    metaTags.push({
      label: repoData.license.name,
      value: "license",
      color: "bg-[#FEF9C3] text-black",
    });

  /* helper: stat chips */
  const stats: {
    label: string;
    value: number;
    bg: string;
    text: string;
    tooltip: string;
  }[] = [];
  if (visibleFields.stargazers)
    stats.push({
      label: "★",
      value: repoData.stargazers_count ?? 0,
      bg: "bg-[#FFE66D]",
      text: "text-black",
      tooltip: "Stars",
    });
  if (visibleFields.watchers)
    stats.push({
      label: "👁",
      value: repoData.watchers_count ?? 0,
      bg: "bg-[#4ECDC4]",
      text: "text-black",
      tooltip: "Watchers",
    });
  if (visibleFields.forks)
    stats.push({
      label: "⑂",
      value: repoData.forks_count ?? 0,
      bg: "bg-[#6366F1]",
      text: "text-white",
      tooltip: "Forks",
    });
  if (visibleFields.open_issues)
    stats.push({
      label: "!",
      value: repoData.open_issues_count ?? 0,
      bg: "bg-black",
      text: "text-white",
      tooltip: "Open issues",
    });

  return (
    <div
      className="w-full rounded-md border-[2.5px] border-black bg-white shadow-[4px_4px_0px_#000] overflow-hidden"
      data-uuid={props.id}
    >
      {/* ── header row ── */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#FAFAFA] border-b-[2.5px] border-black">
        {visibleFields.owner_avatar && (
          <div className="h-9 w-9 rounded-full border-2 border-black overflow-hidden bg-[#4ECDC4] shrink-0">
            {repoData.owner?.avatar_url ? (
              <img
                src={repoData.owner.avatar_url}
                alt={repoData.owner?.login || "owner"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[9px] font-black text-black">
                {(repoData.owner?.login || "GH").slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            {visibleFields.name && repoData.name && (
              <span className="text-sm font-black text-black truncate leading-tight">
                {repoData.name}
              </span>
            )}
            {visibleFields.owner_login && repoData.owner?.login && (
              <span className="text-[11px] text-black/50 font-semibold truncate leading-tight">
                by {repoData.owner.login}
              </span>
            )}
          </div>
          {visibleFields.full_name && repoData.full_name && (
            <div className="text-[11px] text-black/45 font-bold truncate leading-tight">
              {repoData.full_name}
            </div>
          )}
        </div>

        {repoData.html_url && (
          <button
            className="shrink-0 rounded border-2 border-black bg-black px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-[2px_2px_0px_#000] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            onClick={() => window.open(repoData.html_url, "_blank")}
          >
            Open ↗
          </button>
        )}
      </div>

      {/* ── body ── */}
      <div className="px-3 py-2 space-y-2">
        {/* description */}
        {visibleFields.description && repoData.description && (
          <p className="text-[12.5px] leading-snug text-black/70">
            {repoData.description}
          </p>
        )}

        {/* stats row */}
        {stats.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {stats.map((s) => (
              <div
                key={s.label}
                className={`inline-flex items-center gap-1 rounded border-2 border-black px-2 py-0.5 ${s.bg} shadow-[2px_2px_0px_#000]`}
                title={s.tooltip}
                aria-label={s.tooltip}
              >
                <span className={`text-[11px] ${s.text}`}>{s.label}</span>
                <span className={`text-xs font-black ${s.text}`}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* meta tags */}
        {metaTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {metaTags.map((t) => (
              <span
                key={t.label}
                className={`inline-block rounded border-[1.5px] border-black px-1.5 py-px text-[10px] font-bold ${t.color}`}
              >
                {t.value ? `${t.value}: ` : ""}
                {t.label}
              </span>
            ))}
          </div>
        )}

        {/* homepage */}
        {visibleFields.homepage && repoData.homepage && (
          <div className="text-[11px] text-black/60 truncate">
            <span className="font-bold text-black/80">🔗 </span>
            <a
              href={toExternalHref(repoData.homepage)}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all underline hover:text-black cursor-pointer"
              title="Open homepage"
            >
              {repoData.homepage}
            </a>
          </div>
        )}

        {/* timestamps */}
        {(visibleFields.updated_at || visibleFields.pushed_at) && (
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-black/50 font-semibold">
            {visibleFields.updated_at && repoData.updated_at && (
              <span>
                Updated {new Date(repoData.updated_at).toLocaleDateString()}
              </span>
            )}
            {visibleFields.pushed_at && repoData.pushed_at && (
              <span>
                Pushed {new Date(repoData.pushed_at).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── readme section ── */}
      {(visibleFields.readme_title ||
        visibleFields.readme_summary ||
        visibleFields.readme_headings) &&
        (readmeTitle ||
          readmeSummary ||
          readmeHeadings.length > 0 ||
          !readmeRaw) && (
          <div className="border-t-[2.5px] border-black bg-[#FFF8E7] px-3 py-2 space-y-1">
            <div className="text-[10px] font-black text-black/80 uppercase tracking-wider">
              README
            </div>

            {visibleFields.readme_title && readmeTitle && (
              <div className="text-xs text-black font-bold leading-tight">
                {readmeTitle}
              </div>
            )}

            {visibleFields.readme_summary && readmeSummary && (
              <p className="text-[11.5px] leading-snug text-black/65">
                {readmeSummary}
              </p>
            )}

            {visibleFields.readme_headings && readmeHeadings.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {readmeHeadings.map((heading) => (
                  <span
                    key={heading}
                    className="inline-block rounded border-[1.5px] border-black/30 bg-white/60 px-1.5 py-px text-[10px] font-semibold text-black/60"
                  >
                    {heading}
                  </span>
                ))}
              </div>
            )}

            {!readmeRaw && (
              <p className="text-[10px] text-black/40 italic">
                No README available.
              </p>
            )}
          </div>
        )}
    </div>
  );
}

export default GithubRepo;
