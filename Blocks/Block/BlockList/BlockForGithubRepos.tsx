import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Switch } from "@/src/components/ui/switch";
import { useBlockStore } from "@/store/useBlockStore";
import { ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
  uuid: string;
}

interface RepoOwner {
  login: string;
  avatar_url: string;
  html_url: string;
}

interface RepoSummary {
  id: number;
  name: string;
  full_name: string;
}

interface RepoDetails {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  owner: RepoOwner;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  updated_at: string;
  pushed_at: string;
  license: { name: string } | null;
}

type ParseResult =
  | { mode: "profile"; username: string }
  | { mode: "repo"; owner: string; repo: string }
  | null;

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

function parseGithubRepoInput(input: string): ParseResult {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (isValidGithubUsername(trimmed)) {
    return { mode: "profile", username: trimmed };
  }

  try {
    const parsed = new URL(normalizeUrl(trimmed));
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (host !== "github.com") return null;

    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length === 1 && isValidGithubUsername(segments[0])) {
      return { mode: "profile", username: segments[0] };
    }

    if (
      segments.length === 2 &&
      isValidGithubUsername(segments[0]) &&
      /^[a-z\d._-]+$/i.test(segments[1])
    ) {
      return {
        mode: "repo",
        owner: segments[0],
        repo: segments[1],
      };
    }

    return null;
  } catch {
    return null;
  }
}

function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .trim();
}

function parseReadmeBasics(readme: string) {
  const headingMatch = readme.match(/^#\s+(.+)$/m);
  const title = headingMatch?.[1]?.trim() || "";

  const lines = readme
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const summaryRaw =
    lines.find(
      (line) =>
        !line.startsWith("#") &&
        !line.startsWith("-") &&
        !line.startsWith("*") &&
        !line.startsWith("`") &&
        !line.startsWith("["),
    ) || "";
  const summary = stripMarkdown(summaryRaw).slice(0, 240);

  const headings = Array.from(readme.matchAll(/^##\s+(.+)$/gm))
    .map((match) => match[1].trim())
    .slice(0, 6);

  return { title, summary, headings };
}

function BlockForGithubRepos({ isEdit, setError, uuid }: Props) {
  const updateBlock = useBlockStore((state) => state.updateBlockData);
  const [inputValue, setInputValue] = useState("");
  const [parsedInput, setParsedInput] = useState<ParseResult>(null);
  const [localError, setLocalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [repoOwner, setRepoOwner] = useState("");
  const [repos, setRepos] = useState<RepoSummary[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [repoData, setRepoData] = useState<RepoDetails | null>(null);

  const [readmeRaw, setReadmeRaw] = useState("");
  const [readmeTitle, setReadmeTitle] = useState("");
  const [readmeSummary, setReadmeSummary] = useState("");
  const [readmeHeadings, setReadmeHeadings] = useState<string[]>([]);

  const [visibleFields, setVisibleFields] = useState(DEFAULT_VISIBLE_FIELDS);

  useEffect(() => {
    const parsed = parseGithubRepoInput(inputValue);
    if (!inputValue.trim()) {
      setParsedInput(null);
      setLocalError("");
      setError(false);
      return;
    }

    if (!parsed) {
      setParsedInput(null);
      setLocalError(
        "Use username, github.com/username, or github.com/username/repository.",
      );
      setError(true);
      return;
    }

    setParsedInput(parsed);
    setLocalError("");
    setError(false);
  }, [inputValue, setError]);

  useEffect(() => {
    if (!isEdit) {
      updateBlock(uuid, {
        inputValue,
        repoOwner,
        selectedRepo,
        repos,
        repoData,
        readmeRaw,
        readmeTitle,
        readmeSummary,
        readmeHeadings,
        visibleFields,
      });
    }
  }, [
    isEdit,
    inputValue,
    repoOwner,
    selectedRepo,
    repos,
    repoData,
    readmeRaw,
    readmeTitle,
    readmeSummary,
    readmeHeadings,
    visibleFields,
    updateBlock,
    uuid,
  ]);

  const fetchUserRepos = async (username: string) => {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
    );
    if (!response.ok) {
      throw new Error("Unable to fetch repositories for this user");
    }
    const data = (await response.json()) as RepoSummary[];
    return data;
  };

  const fetchRepoDetails = async (owner: string, repo: string) => {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
    );
    if (!response.ok) {
      throw new Error("Unable to fetch repository details");
    }
    return (await response.json()) as RepoDetails;
  };

  const fetchRepoReadme = async (owner: string, repo: string) => {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: { Accept: "application/vnd.github.raw+json" },
      },
    );

    if (!response.ok) return "";
    return response.text();
  };

  const loadSelectedRepo = async (owner: string, repo: string) => {
    const [details, readme] = await Promise.all([
      fetchRepoDetails(owner, repo),
      fetchRepoReadme(owner, repo),
    ]);

    const basics = parseReadmeBasics(readme);
    setRepoData(details);
    setReadmeRaw(readme);
    setReadmeTitle(basics.title);
    setReadmeSummary(basics.summary);
    setReadmeHeadings(basics.headings);
  };

  const handleFetch = async () => {
    if (!parsedInput) {
      setLocalError(
        "Use username, github.com/username, or github.com/username/repository.",
      );
      setError(true);
      return;
    }

    try {
      setIsLoading(true);
      setLocalError("");

      const owner =
        parsedInput.mode === "profile"
          ? parsedInput.username
          : parsedInput.owner;
      const reposData = await fetchUserRepos(owner);
      setRepoOwner(owner);
      setRepos(reposData);

      if (reposData.length === 0) {
        setSelectedRepo("");
        setRepoData(null);
        setReadmeRaw("");
        setReadmeTitle("");
        setReadmeSummary("");
        setReadmeHeadings([]);
        toast.warning("No public repositories found");
        return;
      }

      const defaultRepoName =
        parsedInput.mode === "repo" ? parsedInput.repo : reposData[0].name;

      const repoExists = reposData.some(
        (repo) => repo.name === defaultRepoName,
      );
      const nextRepo = repoExists ? defaultRepoName : reposData[0].name;

      setSelectedRepo(nextRepo);
      await loadSelectedRepo(owner, nextRepo);
      setError(false);
      toast.success("GitHub repository data loaded");
    } catch {
      setRepoOwner("");
      setRepos([]);
      setSelectedRepo("");
      setRepoData(null);
      setReadmeRaw("");
      setReadmeTitle("");
      setReadmeSummary("");
      setReadmeHeadings([]);
      setLocalError("Failed to fetch repository data. Please try again.");
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRepo = async (repoName: string) => {
    setSelectedRepo(repoName);
    if (!repoOwner) return;
    try {
      setIsLoading(true);
      await loadSelectedRepo(repoOwner, repoName);
      setError(false);
    } catch {
      setLocalError("Failed to load selected repository.");
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleField = (field: FieldKey, checked: boolean) => {
    setVisibleFields((prev) => ({ ...prev, [field]: checked }));
  };

  return (
    <div>
      {isEdit ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              GitHub Username / Profile / Repository
            </Label>
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="github.com/nativeanish/metalink"
                className="bg-muted/40"
              />
              <Button
                onClick={handleFetch}
                disabled={!parsedInput || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Fetch"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Accepts: nativeanish, github.com/nativeanish, or
              github.com/nativeanish/metalink
            </p>
          </div>

          {localError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {localError}
            </div>
          )}

          {repos.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Repository</Label>
              <Select value={selectedRepo} onValueChange={handleSelectRepo}>
                <SelectTrigger className="bg-muted/40">
                  <SelectValue placeholder="Choose repository" />
                </SelectTrigger>
                <SelectContent>
                  {repos.map((repo) => (
                    <SelectItem key={repo.id} value={repo.name}>
                      {repo.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {repoData && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Show Repository Fields
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(
                    [
                      ["owner_avatar", "Owner Avatar"],
                      ["owner_login", "Owner Username"],
                      ["name", "Repository Name"],
                      ["full_name", "Full Name"],
                      ["description", "Description"],
                      ["homepage", "Homepage"],
                      ["language", "Primary Language"],
                      ["stargazers", "Stars"],
                      ["watchers", "Watchers"],
                      ["forks", "Forks"],
                      ["open_issues", "Open Issues"],
                      ["default_branch", "Default Branch"],
                      ["license", "License"],
                      ["updated_at", "Updated At"],
                      ["pushed_at", "Pushed At"],
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
                  Show README Basics
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(
                    [
                      ["readme_title", "README Title"],
                      ["readme_summary", "README Summary"],
                      ["readme_headings", "README Section Headings"],
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
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {!repoData ? (
            <p className="text-sm text-muted-foreground italic">
              No GitHub repository configured
            </p>
          ) : (
            <>
              <div className="rounded-lg border p-3 space-y-3">
                <div className="flex items-start gap-3">
                  {visibleFields.owner_avatar && (
                    <img
                      src={repoData.owner.avatar_url}
                      alt={repoData.owner.login}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    {visibleFields.name && (
                      <div className="text-sm font-semibold">
                        {repoData.name}
                      </div>
                    )}
                    {visibleFields.full_name && (
                      <div className="text-xs text-muted-foreground">
                        {repoData.full_name}
                      </div>
                    )}
                    {visibleFields.owner_login && (
                      <div className="text-xs text-muted-foreground">
                        Owner: {repoData.owner.login}
                      </div>
                    )}
                    {visibleFields.description && repoData.description && (
                      <p className="text-sm text-muted-foreground">
                        {repoData.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => window.open(repoData.html_url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {visibleFields.stargazers && (
                    <div className="rounded bg-muted/40 p-2">
                      <div className="font-medium">Stars</div>
                      <div className="text-muted-foreground">
                        {repoData.stargazers_count}
                      </div>
                    </div>
                  )}
                  {visibleFields.watchers && (
                    <div className="rounded bg-muted/40 p-2">
                      <div className="font-medium">Watchers</div>
                      <div className="text-muted-foreground">
                        {repoData.watchers_count}
                      </div>
                    </div>
                  )}
                  {visibleFields.forks && (
                    <div className="rounded bg-muted/40 p-2">
                      <div className="font-medium">Forks</div>
                      <div className="text-muted-foreground">
                        {repoData.forks_count}
                      </div>
                    </div>
                  )}
                  {visibleFields.open_issues && (
                    <div className="rounded bg-muted/40 p-2">
                      <div className="font-medium">Open Issues</div>
                      <div className="text-muted-foreground">
                        {repoData.open_issues_count}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-sm">
                  {visibleFields.language && repoData.language && (
                    <div>
                      <span className="font-medium">Language: </span>
                      <span className="text-muted-foreground">
                        {repoData.language}
                      </span>
                    </div>
                  )}
                  {visibleFields.homepage && repoData.homepage && (
                    <div>
                      <span className="font-medium">Homepage: </span>
                      <span className="text-muted-foreground truncate">
                        {repoData.homepage}
                      </span>
                    </div>
                  )}
                  {visibleFields.default_branch && (
                    <div>
                      <span className="font-medium">Default Branch: </span>
                      <span className="text-muted-foreground">
                        {repoData.default_branch}
                      </span>
                    </div>
                  )}
                  {visibleFields.license && repoData.license?.name && (
                    <div>
                      <span className="font-medium">License: </span>
                      <span className="text-muted-foreground">
                        {repoData.license.name}
                      </span>
                    </div>
                  )}
                  {visibleFields.updated_at && (
                    <div>
                      <span className="font-medium">Updated: </span>
                      <span className="text-muted-foreground">
                        {new Date(repoData.updated_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {visibleFields.pushed_at && (
                    <div>
                      <span className="font-medium">Pushed: </span>
                      <span className="text-muted-foreground">
                        {new Date(repoData.pushed_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {(visibleFields.readme_title ||
                visibleFields.readme_summary ||
                visibleFields.readme_headings) && (
                <div className="rounded-lg border p-3 space-y-2">
                  <Label className="text-sm font-medium">README Basics</Label>
                  {visibleFields.readme_title && readmeTitle && (
                    <div className="text-sm">
                      <span className="font-medium">Title: </span>
                      <span className="text-muted-foreground">
                        {readmeTitle}
                      </span>
                    </div>
                  )}
                  {visibleFields.readme_summary && readmeSummary && (
                    <p className="text-sm text-muted-foreground">
                      {readmeSummary}
                    </p>
                  )}
                  {visibleFields.readme_headings &&
                    readmeHeadings.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Sections</p>
                        <div className="space-y-1">
                          {readmeHeadings.map((heading) => (
                            <div
                              key={heading}
                              className="text-sm text-muted-foreground"
                            >
                              • {heading}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  {!readmeRaw && (
                    <p className="text-xs text-muted-foreground">
                      README not available for this repository.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default BlockForGithubRepos;
