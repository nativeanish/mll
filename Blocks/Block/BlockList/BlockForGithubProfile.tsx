import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import { useBlockStore } from "@/store/useBlockStore";
import { ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
  uuid: string;
}

interface GitHubUserResponse {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  email: string | null;
  bio: string | null;
  twitter_username: string | null;
  location: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  followers_url: string;
  following_url: string;
}

interface GitHubRepoResponse {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
}

interface GitHubFollowResponse {
  id: number;
  login: string;
  html_url: string;
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

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidGithubUsername(value: string) {
  if (!/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(value)) return false;
  if (value.startsWith("-") || value.endsWith("-")) return false;
  if (value.includes("--")) return false;
  return true;
}

function parseGithubUsername(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (isValidGithubUsername(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(normalizeUrl(trimmed));
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (host !== "github.com") return null;

    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length !== 1) return null;
    return isValidGithubUsername(parts[0]) ? parts[0] : null;
  } catch {
    return null;
  }
}

function BlockForGithubProfile({ isEdit, setError, uuid }: Props) {
  const updateBlock = useBlockStore((state) => state.updateBlockData);
  const [profileUrl, setProfileUrl] = useState("");
  const [username, setUsername] = useState("");
  const [user, setUser] = useState<GitHubUserResponse | null>(null);
  const [repos, setRepos] = useState<GitHubRepoResponse[]>([]);
  const [followersList, setFollowersList] = useState<GitHubFollowResponse[]>(
    [],
  );
  const [followingList, setFollowingList] = useState<GitHubFollowResponse[]>(
    [],
  );
  const [pinnedRepos, setPinnedRepos] = useState<string[]>([]);
  const [visibleFields, setVisibleFields] = useState(DEFAULT_VISIBLE_FIELDS);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    const parsedUsername = parseGithubUsername(profileUrl);
    if (!profileUrl.trim()) {
      setLocalError("");
      setError(false);
      setUsername("");
      return;
    }

    if (!parsedUsername) {
      setLocalError(
        "Use only: username, github.com/username, or https://github.com/username.",
      );
      setError(true);
      setUsername("");
      return;
    }

    setLocalError("");
    setError(false);
    setUsername(parsedUsername);
  }, [profileUrl, setError]);

  useEffect(() => {
    if (!isEdit) {
      updateBlock(uuid, {
        profileUrl,
        username,
        user,
        repos,
        followersList,
        followingList,
        pinnedRepos,
        visibleFields,
      });
    }
  }, [
    isEdit,
    profileUrl,
    username,
    user,
    repos,
    followersList,
    followingList,
    pinnedRepos,
    visibleFields,
    updateBlock,
    uuid,
  ]);

  const handleFetchProfile = async () => {
    if (!username) {
      setLocalError(
        "Use only: username, github.com/username, or https://github.com/username.",
      );
      setError(true);
      return;
    }

    try {
      setIsLoading(true);
      setLocalError("");
      const userResponse = await fetch(
        `https://api.github.com/users/${username}`,
      );
      if (!userResponse.ok) {
        throw new Error("Unable to fetch GitHub profile");
      }
      const userData: GitHubUserResponse = await userResponse.json();

      const followingApiUrl = userData.following_url.replace(
        "{/other_user}",
        "",
      );

      const [reposResponse, followersResponse, followingResponse] =
        await Promise.all([
          fetch(
            `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
          ),
          fetch(`${userData.followers_url}?per_page=10`),
          fetch(`${followingApiUrl}?per_page=10`),
        ]);

      if (!reposResponse.ok || !followersResponse.ok || !followingResponse.ok) {
        throw new Error("Unable to fetch related GitHub data");
      }

      const reposData: GitHubRepoResponse[] = await reposResponse.json();
      const followersData: GitHubFollowResponse[] =
        await followersResponse.json();
      const followingData: GitHubFollowResponse[] =
        await followingResponse.json();

      setUser(userData);
      setRepos(reposData);
      setFollowersList(followersData);
      setFollowingList(followingData);
      setPinnedRepos((prev) =>
        prev.filter((repoName) => reposData.some((r) => r.name === repoName)),
      );
      toast.success("GitHub profile loaded");
    } catch {
      setUser(null);
      setRepos([]);
      setFollowersList([]);
      setFollowingList([]);
      setPinnedRepos([]);
      setLocalError("Failed to fetch GitHub profile data. Please try again.");
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleField = (field: FieldKey, checked: boolean) => {
    setVisibleFields((prev) => ({ ...prev, [field]: checked }));
  };

  const togglePinnedRepo = (repoName: string) => {
    setPinnedRepos((prev) => {
      if (prev.includes(repoName)) {
        return prev.filter((name) => name !== repoName);
      }
      if (prev.length >= 5) {
        toast.warning("You can pin up to 5 repositories");
        return prev;
      }
      return [...prev, repoName];
    });
  };

  const pinnedRepoData = useMemo(
    () => repos.filter((repo) => pinnedRepos.includes(repo.name)),
    [repos, pinnedRepos],
  );

  const renderUserField = (label: string, value: string | null | undefined) => {
    if (!value) return null;
    return (
      <div className="text-sm">
        <span className="font-medium">{label}: </span>
        <span className="text-muted-foreground">{value}</span>
      </div>
    );
  };

  const renderFollowList = (title: string, items: GitHubFollowResponse[]) => {
    if (items.length === 0) {
      return (
        <div className="text-sm text-muted-foreground">No data available</div>
      );
    }

    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">{title}</p>
        <div className="space-y-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="text-sm text-muted-foreground truncate"
            >
              {item.login}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {isEdit ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">GitHub Profile URL</Label>
            <div className="flex gap-2">
              <Input
                value={profileUrl}
                onChange={(event) => setProfileUrl(event.target.value)}
                placeholder="github.com/nativeanish"
                className="bg-muted/40"
              />
              <Button
                onClick={handleFetchProfile}
                disabled={!username || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Fetch"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Accepts only: username, github.com/nativeanish, or
              https://github.com/nativeanish
            </p>
          </div>

          {localError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {localError}
            </div>
          )}

          {user && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Show Fields</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(
                    [
                      ["avatar", "Avatar"],
                      ["username", "Username"],
                      ["name", "Name"],
                      ["email", "Email"],
                      ["bio", "Bio"],
                      ["twitter_username", "Twitter Username"],
                      ["location", "Location"],
                      ["public_repos", "Public Repositories"],
                      ["public_gists", "Public Gists"],
                      ["followers", "Followers Count"],
                      ["following", "Following Count"],
                      ["followers_list", "Followers List"],
                      ["following_list", "Following List"],
                    ] as [FieldKey, string][]
                  ).map(([field, label]) => (
                    <div
                      key={field}
                      className="flex items-center justify-between rounded border p-2"
                    >
                      <Label className="text-sm">{label}</Label>
                      <Switch
                        checked={visibleFields[field]}
                        onCheckedChange={(checked) =>
                          toggleField(field, checked)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Follower APIs Availability
                </Label>
                <div className="rounded border p-3 space-y-2 text-sm">
                  <div>
                    <span className="font-medium">followers_url: </span>
                    <span className="text-muted-foreground break-all">
                      {user.followers_url}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">following_url: </span>
                    <span className="text-muted-foreground break-all">
                      {user.following_url}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Pin Public Repositories (up to 5)
                </Label>
                <div className="max-h-52 overflow-y-auto rounded border p-2 space-y-2">
                  {repos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No public repositories found.
                    </p>
                  ) : (
                    repos.map((repo) => (
                      <button
                        type="button"
                        key={repo.id}
                        onClick={() => togglePinnedRepo(repo.name)}
                        className={`w-full text-left rounded border p-2 text-sm ${
                          pinnedRepos.includes(repo.name)
                            ? "border-primary bg-primary/10"
                            : "border-border"
                        }`}
                      >
                        <div className="font-medium">{repo.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {repo.description || repo.full_name}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {!user ? (
            <p className="text-sm text-muted-foreground italic">
              No GitHub profile configured
            </p>
          ) : (
            <>
              <div className="rounded-lg border p-3 space-y-3">
                <div className="flex items-start gap-3">
                  {visibleFields.avatar && (
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={user.avatar_url} alt={user.login} />
                      <AvatarFallback>
                        {user.login.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1 space-y-1 min-w-0">
                    {visibleFields.username && (
                      <div className="text-sm font-semibold">@{user.login}</div>
                    )}
                    {visibleFields.name && renderUserField("Name", user.name)}
                    {visibleFields.email &&
                      renderUserField("Email", user.email)}
                    {visibleFields.bio && renderUserField("Bio", user.bio)}
                    {visibleFields.twitter_username &&
                      renderUserField("Twitter", user.twitter_username)}
                    {visibleFields.location &&
                      renderUserField("Location", user.location)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => window.open(user.html_url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {visibleFields.public_repos && (
                    <div className="rounded bg-muted/40 p-2">
                      <div className="font-medium">Public Repos</div>
                      <div className="text-muted-foreground">
                        {user.public_repos}
                      </div>
                    </div>
                  )}
                  {visibleFields.public_gists && (
                    <div className="rounded bg-muted/40 p-2">
                      <div className="font-medium">Public Gists</div>
                      <div className="text-muted-foreground">
                        {user.public_gists}
                      </div>
                    </div>
                  )}
                  {visibleFields.followers && (
                    <div className="rounded bg-muted/40 p-2">
                      <div className="font-medium">Followers</div>
                      <div className="text-muted-foreground">
                        {user.followers}
                      </div>
                    </div>
                  )}
                  {visibleFields.following && (
                    <div className="rounded bg-muted/40 p-2">
                      <div className="font-medium">Following</div>
                      <div className="text-muted-foreground">
                        {user.following}
                      </div>
                    </div>
                  )}
                </div>

                {(visibleFields.followers_list ||
                  visibleFields.following_list) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {visibleFields.followers_list &&
                      renderFollowList("Followers (available)", followersList)}
                    {visibleFields.following_list &&
                      renderFollowList("Following (available)", followingList)}
                  </div>
                )}
              </div>

              {pinnedRepoData.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Pinned Repositories
                  </Label>
                  <div className="space-y-2">
                    {pinnedRepoData.map((repo) => (
                      <button
                        type="button"
                        key={repo.id}
                        onClick={() => window.open(repo.html_url, "_blank")}
                        className="w-full text-left rounded border p-3 hover:bg-muted/40"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium truncate">
                            {repo.name}
                          </p>
                          <div className="text-xs text-muted-foreground shrink-0">
                            ★ {repo.stargazers_count} · Forks {repo.forks_count}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {repo.description || repo.full_name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default BlockForGithubProfile;
