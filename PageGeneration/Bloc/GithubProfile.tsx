import type { BlockData } from "@/store/useBlockStore";
import { useState } from "react";

interface GithubProfileProps {
  props: BlockData;
}

interface GithubUser {
  login?: string;
  avatar_url?: string;
  html_url?: string;
  name?: string | null;
  email?: string | null;
  bio?: string | null;
  twitter_username?: string | null;
  location?: string | null;
  public_repos?: number;
  public_gists?: number;
  followers?: number;
  following?: number;
}

interface GithubRepo {
  id: number;
  name: string;
  full_name?: string;
  html_url?: string;
  description?: string | null;
  stargazers_count?: number;
  forks_count?: number;
}

interface GithubFollow {
  id: number;
  login: string;
  html_url?: string;
  avatar_url?: string;
}

type FieldKey =
  | "avatar"
  | "username"
  | "name"
  | "email"
  | "bio"
  | "twitter_username"
  | "location"
  | "public_repos"
  | "public_gists"
  | "followers"
  | "following"
  | "followers_list"
  | "following_list";

const DEFAULT_VISIBLE_FIELDS: Record<FieldKey, boolean> = {
  avatar: true,
  username: true,
  name: true,
  email: true,
  bio: true,
  twitter_username: true,
  location: true,
  public_repos: true,
  public_gists: true,
  followers: true,
  following: true,
  followers_list: false,
  following_list: false,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object";

const getStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string") as string[];
};

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

const parseUser = (value: unknown): GithubUser | null => {
  if (!isRecord(value)) return null;
  return {
    login: typeof value.login === "string" ? value.login : undefined,
    avatar_url:
      typeof value.avatar_url === "string" ? value.avatar_url : undefined,
    html_url: typeof value.html_url === "string" ? value.html_url : undefined,
    name:
      typeof value.name === "string" || value.name === null ? value.name : null,
    email:
      typeof value.email === "string" || value.email === null
        ? value.email
        : null,
    bio: typeof value.bio === "string" || value.bio === null ? value.bio : null,
    twitter_username:
      typeof value.twitter_username === "string" ||
      value.twitter_username === null
        ? value.twitter_username
        : null,
    location:
      typeof value.location === "string" || value.location === null
        ? value.location
        : null,
    public_repos:
      typeof value.public_repos === "number" ? value.public_repos : undefined,
    public_gists:
      typeof value.public_gists === "number" ? value.public_gists : undefined,
    followers:
      typeof value.followers === "number" ? value.followers : undefined,
    following:
      typeof value.following === "number" ? value.following : undefined,
  };
};

const parseRepoArray = (value: unknown): GithubRepo[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => isRecord(item) && typeof item.id === "number")
    .map((item) => {
      const repo = item as Record<string, unknown>;
      return {
        id: repo.id as number,
        name: typeof repo.name === "string" ? repo.name : "",
        full_name:
          typeof repo.full_name === "string" ? repo.full_name : undefined,
        html_url: typeof repo.html_url === "string" ? repo.html_url : undefined,
        description:
          typeof repo.description === "string" || repo.description === null
            ? repo.description
            : null,
        stargazers_count:
          typeof repo.stargazers_count === "number"
            ? repo.stargazers_count
            : undefined,
        forks_count:
          typeof repo.forks_count === "number" ? repo.forks_count : undefined,
      };
    })
    .filter((repo) => repo.name.length > 0);
};

const parseFollowArray = (value: unknown): GithubFollow[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item) =>
        isRecord(item) &&
        typeof item.id === "number" &&
        typeof item.login === "string",
    )
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        id: row.id as number,
        login: row.login as string,
        html_url: typeof row.html_url === "string" ? row.html_url : undefined,
        avatar_url:
          typeof row.avatar_url === "string" ? row.avatar_url : undefined,
      };
    });
};

function GithubProfile({ props }: GithubProfileProps) {
  const data = isRecord(props.data) ? props.data : {};
  const user = parseUser(data.user);
  const repos = parseRepoArray(data.repos);
  const followersList = parseFollowArray(data.followersList);
  const followingList = parseFollowArray(data.followingList);
  const pinnedRepos = getStringArray(data.pinnedRepos);
  const visibleFields = parseVisibleFields(data.visibleFields);
  const [activeFollowModal, setActiveFollowModal] = useState<{
    title: string;
    items: GithubFollow[];
  } | null>(null);
  const [showAllPinned, setShowAllPinned] = useState(false);

  if (!user || !user.login) {
    return (
      <div
        className="w-full rounded-lg border-[3px] border-black bg-[#FFE66D] p-6 text-center shadow-[4px_4px_0px_#000]"
        data-uuid={props.id}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white border-[3px] border-black">
          <span className="text-lg font-bold text-black">GH</span>
        </div>
        <div className="text-sm font-bold text-black uppercase">
          No GitHub profile selected
        </div>
        <div className="mt-1 text-xs text-black/70">
          Add a profile in the editor to show it here.
        </div>
      </div>
    );
  }

  const pinnedRepoData = repos.filter((repo) =>
    pinnedRepos.includes(repo.name),
  );

  const renderMetaChip = (label: string, value?: string | null) => {
    if (!value) return null;
    return (
      <span className="inline-flex items-center rounded border-[1.5px] border-black bg-[#FFF8E7] px-1.5 py-0.5 text-[10px] leading-none text-black">
        <span className="font-black">{label}:</span>&nbsp;
        <span className="text-black/70">{value}</span>
      </span>
    );
  };

  const renderXChip = (handle?: string | null) => {
    if (!handle) return null;
    return (
      <a
        href={`https://x.com/${handle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded border-[1.5px] border-black bg-black px-1.5 py-0.5 text-[10px] leading-none text-white font-bold hover:bg-black/80 transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-2.5 w-2.5 fill-current"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span>@{handle}</span>
      </a>
    );
  };

  const visiblePinnedRepos = showAllPinned
    ? pinnedRepoData
    : pinnedRepoData.slice(0, 3);

  const formatNumber = (value?: number) => (value ?? 0).toLocaleString();

  const renderFollowPreview = (title: string, items: GithubFollow[]) => {
    const previewItems = items.slice(0, 5);
    const extraCount = Math.max(0, items.length - 5);

    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black uppercase text-black/60 shrink-0">
          {title} ({items.length})
        </span>

        {items.length > 0 ? (
          <div className="flex items-center -space-x-1.5">
            {previewItems.map((row) => (
              <button
                key={row.id}
                className="h-6 w-6 shrink-0 overflow-hidden rounded-full border-[1.5px] border-black bg-[#4ECDC4] ring-1 ring-white"
                onClick={() => setActiveFollowModal({ title, items })}
                title={row.login}
              >
                {row.avatar_url ? (
                  <img
                    src={row.avatar_url}
                    alt={row.login}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[7px] font-black text-black">
                    {row.login.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </button>
            ))}

            {extraCount > 0 && (
              <button
                className="h-6 shrink-0 rounded-full border-[1.5px] border-black bg-[#FFE66D] px-1.5 text-[9px] font-black text-black ring-1 ring-white"
                onClick={() => setActiveFollowModal({ title, items })}
              >
                +{extraCount}
              </button>
            )}
          </div>
        ) : (
          <span className="text-[10px] text-black/40">None</span>
        )}

        <button
          className="shrink-0 rounded border-[1.5px] border-black bg-white px-1.5 py-px text-[9px] font-bold uppercase text-black hover:bg-[#FFF8E7]"
          onClick={() => setActiveFollowModal({ title, items })}
        >
          View
        </button>
      </div>
    );
  };

  const hasFollowPanels =
    visibleFields.followers_list || visibleFields.following_list;

  /* count how many stat cards are visible */
  const statCards: {
    label: string;
    value: number;
    bg: string;
    text: string;
  }[] = [];
  if (visibleFields.public_repos)
    statCards.push({
      label: "Public Repos",
      value: user.public_repos ?? 0,
      bg: "bg-[#FFE66D]",
      text: "text-black",
    });
  if (visibleFields.public_gists)
    statCards.push({
      label: "Public Gists",
      value: user.public_gists ?? 0,
      bg: "bg-[#4ECDC4]",
      text: "text-black",
    });
  if (visibleFields.followers)
    statCards.push({
      label: "Followers",
      value: user.followers ?? 0,
      bg: "bg-[#6366F1]",
      text: "text-white",
    });
  if (visibleFields.following)
    statCards.push({
      label: "Following",
      value: user.following ?? 0,
      bg: "bg-black",
      text: "text-white",
    });

  /* choose grid columns so cards always fill their row evenly */
  const statGridCols =
    statCards.length <= 2
      ? "grid-cols-2"
      : statCards.length === 3
        ? "grid-cols-3"
        : "grid-cols-2 md:grid-cols-4";

  return (
    <div
      className="w-full rounded-md border-[2.5px] border-black bg-white shadow-[4px_4px_0px_#000] overflow-hidden"
      data-uuid={props.id}
    >
      {/* ── header: avatar + identity ── */}
      <div className="border-b-[2.5px] border-black bg-[#F7FFF7] px-3 py-2">
        <div className="flex items-center gap-2.5">
          {visibleFields.avatar && (
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-[2.5px] border-black bg-[#4ECDC4]">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[11px] font-black text-black">
                  {user.login.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          )}

          <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
            {visibleFields.username && (
              <span className="text-sm font-black text-black">
                @{user.login}
              </span>
            )}
            {visibleFields.twitter_username &&
              renderXChip(user.twitter_username)}
            {user.html_url && (
              <button
                className="ml-auto shrink-0 rounded border-2 border-black bg-black px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-[2px_2px_0px_#000] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_#000]"
                onClick={() => window.open(user.html_url, "_blank")}
              >
                Open Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── meta info strip ── */}
      {(visibleFields.name ||
        visibleFields.email ||
        visibleFields.bio ||
        visibleFields.location) && (
        <div className="flex flex-wrap items-center gap-1.5 border-b-[2.5px] border-black bg-white px-3 py-1.5">
          {visibleFields.name && renderMetaChip("Name", user.name)}
          {visibleFields.email && renderMetaChip("Email", user.email)}
          {visibleFields.bio && renderMetaChip("Bio", user.bio)}
          {visibleFields.location && renderMetaChip("Location", user.location)}
        </div>
      )}

      {/* ── follow previews row ── */}
      {hasFollowPanels && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b-[2.5px] border-black bg-[#FFF8E7] px-3 py-2">
          {visibleFields.followers_list &&
            renderFollowPreview("Followers", followersList)}
          {visibleFields.following_list &&
            renderFollowPreview("Following", followingList)}
        </div>
      )}

      {/* ── stat cards ── */}
      {statCards.length > 0 && (
        <div
          className={`grid ${statGridCols} gap-0 border-b-[2.5px] border-black`}
        >
          {statCards.map((s, i) => (
            <div
              key={s.label}
              className={`${s.bg} px-3 py-2 text-center ${i < statCards.length - 1 ? "border-r-[2.5px] border-black" : ""}`}
            >
              <div className={`text-[10px] font-black uppercase ${s.text}`}>
                {s.label}
              </div>
              <div className={`text-lg font-black leading-tight ${s.text}`}>
                {formatNumber(s.value)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── pinned repos ── */}
      {pinnedRepoData.length > 0 && (
        <div className="px-3 py-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/70">
              Pinned Repositories ({pinnedRepoData.length})
            </span>
            {pinnedRepoData.length > 3 && (
              <button
                className="rounded border-2 border-black bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase text-black shadow-[2px_2px_0px_#000] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_#000]"
                onClick={() => setShowAllPinned((prev) => !prev)}
              >
                {showAllPinned ? "Show Less" : "Show All"}
              </button>
            )}
          </div>

          <div className="grid gap-1.5 md:grid-cols-2">
            {visiblePinnedRepos.map((repo) => (
              <button
                key={repo.id}
                className="w-full rounded border-[2.5px] border-black bg-[#FFF8E7] px-2.5 py-1.5 text-left shadow-[3px_3px_0px_#000] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000]"
                onClick={() =>
                  repo.html_url && window.open(repo.html_url, "_blank")
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-black leading-tight">
                      {repo.name}
                    </p>
                    <p className="truncate text-[11px] text-black/60 leading-tight">
                      {repo.description || repo.full_name || "No description"}
                    </p>
                  </div>
                  <div className="shrink-0 text-[10px] font-bold text-black/50">
                    ★{formatNumber(repo.stargazers_count)} · ⑂
                    {formatNumber(repo.forks_count)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeFollowModal && (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border-[3px] border-black bg-white shadow-[6px_6px_0px_#000]">
            <div className="flex items-center justify-between border-b-[3px] border-black px-4 py-3">
              <h3 className="text-sm font-black uppercase text-black">
                {activeFollowModal.title}
              </h3>
              <button
                className="rounded-lg border-2 border-black bg-[#FFE66D] px-2 py-1 text-xs font-bold text-black"
                onClick={() => setActiveFollowModal(null)}
              >
                Close
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-3 space-y-2">
              {activeFollowModal.items.map((row) => (
                <button
                  key={row.id}
                  className="w-full rounded-lg border-2 border-black bg-[#FFF8E7] px-3 py-2 text-left hover:bg-[#FFE66D]/60"
                  onClick={() =>
                    window.open(
                      row.html_url || `https://github.com/${row.login}`,
                      "_blank",
                    )
                  }
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full border-2 border-black overflow-hidden bg-[#4ECDC4] shrink-0">
                      {row.avatar_url ? (
                        <img
                          src={row.avatar_url}
                          alt={row.login}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-black">
                          {row.login.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-bold text-black truncate">
                      {row.login}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GithubProfile;
