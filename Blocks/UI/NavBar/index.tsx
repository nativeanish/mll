import * as React from "react";
import { useRef } from "react";
import {
  BellIcon,
  Check,
  User,
  Unplug,
  Wifi,
  Wallet,
  Moon,
  Sun,
  Globe,
  Loader2,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";
import { Token } from "@/utils/ao/token";
import { useQuery } from "@tanstack/react-query";
import {
  get_ao_balance,
  get_ar_balance,
  get_ario_balance,
  get_war_balance,
} from "@/utils/ao/balance";
import { disconnectWallet as disconnect } from "@/utils/wallet";
import { useTheme } from "@/hooks/useTheme";
import useWallet from "@/store/useWallet";
import Logo from "@/assets/Logo";
const NotificationMenu = ({
  notificationCount = 3,
  onItemClick,
}: {
  notificationCount?: number;
  onItemClick?: (item: string) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 relative rounded-full hover:bg-muted/80 transition-colors"
      >
        <BellIcon size={16} />
        {notificationCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white ring-2 ring-background">
            {notificationCount > 9 ? "9+" : notificationCount}
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      className="w-80 rounded-xl shadow-xl border-border/50"
    >
      <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Notifications
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => onItemClick?.("notification1")}
        className="rounded-lg cursor-pointer"
      >
        <div className="flex flex-col gap-1 py-1">
          <p className="text-sm font-medium">New message received</p>
          <p className="text-xs text-muted-foreground">2 minutes ago</p>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => onItemClick?.("notification2")}
        className="rounded-lg cursor-pointer"
      >
        <div className="flex flex-col gap-1 py-1">
          <p className="text-sm font-medium">System update available</p>
          <p className="text-xs text-muted-foreground">1 hour ago</p>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => onItemClick?.("notification3")}
        className="rounded-lg cursor-pointer"
      >
        <div className="flex flex-col gap-1 py-1">
          <p className="text-sm font-medium">Weekly report ready</p>
          <p className="text-xs text-muted-foreground">3 hours ago</p>
        </div>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => onItemClick?.("view-all")}
        className="rounded-lg cursor-pointer"
      >
        <Check className="mr-2 h-4 w-4" />
        Mark all as read
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
const formatAddress = (addr: string) => {
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

// Reusable hook to fetch a token balance with safe fallbacks
function useBalanceQuery(
  key: string,
  address: string,
  fetcher: (addr: string) => Promise<string>,
) {
  return useQuery<string | null>({
    queryKey: [key, address],
    queryFn: async () => {
      if (!address) return null;
      try {
        const v = await fetcher(address);
        return v ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!address,
  });
}
const UserButton = ({ address }: { address: string }) => {
  const wallet = useWallet((state) => state.type);
  const ario = useBalanceQuery("ario-balance", address, get_ario_balance);
  const ar = useBalanceQuery("ar-balance", address, get_ar_balance);
  const ao = useBalanceQuery("ao-balance", address, get_ao_balance);
  const war = useBalanceQuery("war-balance", address, get_war_balance);
  const theme = useTheme().theme;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 px-3 py-1.5 h-9
             bg-emerald-50 dark:bg-emerald-950/40
             border-emerald-200 dark:border-emerald-800/50
             rounded-full hover:bg-emerald-100
             dark:hover:bg-emerald-900/50
             transition-all duration-200"
        >
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <User className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono hidden sm:inline">
            {formatAddress(address)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 rounded-xl shadow-xl border-border/50"
      >
        <DropdownMenuItem className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-mono rounded-lg">
          <div className="flex justify-between w-full items-center">
            <div className="flex items-center gap-2">
              <Wifi className="text-emerald-500" />
              <span className="font-mono">Connected</span>
            </div>
            {wallet === "wander" ? (
              <img
                src="https://arweave.net/qbL1viCRNm6RfKHQXztVdKmf5Q0WKmOLmNdTht7G9PE"
                className="h-6 w-6"
                alt="Wander"
              />
            ) : wallet === "metamask" ? (
              <img
                src="https://arweave.net/AygXinftYYvlUOEyJ_RQsOxpnpzJ9HD6xxsML6prLdo"
                className="h-6 w-6"
                alt="MetaMask"
              />
            ) : wallet === "arweave" ? (
              theme === "dark" ? (
                <img
                  src="https://arweave.net/r6TvdrKbdBtWUaCs_m1sT9ce1JWxE4lhJlOOixb_INw"
                  className="h-7 w-7"
                  alt="Arweave"
                />
              ) : (
                <img
                  src="https://arweave.net/ntfnBJCwLW8nFY083UJCcGYCZt5uUuRBd3szkGoAE6E"
                  className="h-7 w-7"
                  alt="Arweave"
                />
              )
            ) : wallet === "beacon" ? (
              <img
                src="https://arweave.net/E-oGpzqQF0N_vw-t3hokpefxj_Ka_fBee_hZ2cK6vIo"
                className="h-6 w-6"
                alt="Beacon"
              />
            ) : (
              <Wallet className="w-6 h-6" />
            )}
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <div className="flex justify-between w-full items-center">
            <img
              src={`https://arweave.net/${Token.find((e) => e.symbol === "ARIO")?.logo}`}
              className="w-6 h-6 mr-2"
            />
            <span className="text-sm font-medium">
              {ario.isLoading
                ? "Loading..."
                : ario.data
                  ? (Token.find((e) => e.symbol === "ARIO")?.denomination
                      ? parseFloat(ario.data) /
                        Math.pow(
                          10,
                          Token.find((e) => e.symbol === "ARIO")
                            ?.denomination ?? 1,
                        )
                      : parseFloat(ario.data).toFixed(2)) + " $ARIO"
                  : "Failed to fetch"}
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="flex justify-between w-full items-center">
            <img
              src={`https://arweave.net/${Token.find((e) => e.symbol === "wAR")?.logo}`}
              className="w-6 h-6 mr-2"
            />
            <span className="text-sm font-medium">
              {war.isLoading
                ? "Loading..."
                : war.data
                  ? war.data + " $wAR"
                  : "Failed to fetch"}
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="flex justify-between w-full items-center">
            {theme === "dark" ? (
              <img
                src="https://arweave.net/r6TvdrKbdBtWUaCs_m1sT9ce1JWxE4lhJlOOixb_INw"
                className="w-6 h-6 mr-2"
              />
            ) : (
              <img
                src="https://arweave.net/ntfnBJCwLW8nFY083UJCcGYCZt5uUuRBd3szkGoAE6E"
                className="w-6 h-6 mr-2"
              />
            )}
            <span className="text-sm font-medium">
              {ar.isLoading
                ? "Loading..."
                : ar.data
                  ? ar.data + " $AR"
                  : "Failed to fetch"}
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="flex justify-between w-full items-center">
            {theme === "dark" ? (
              <img
                src="https://arweave.net/UVK6iwKDIqAo_vfWIMqIiwV7Qp4mY4y8QPyi2sdrCeo"
                className="w-6 h-6 mr-2"
              />
            ) : (
              <img
                src="https://arweave.net/O-DVZ_sUmrNdZKhgoPrACAsApCUTvMmeyjH_Et_UWi8"
                className="w-6 h-6 mr-2"
              />
            )}
            <span className="text-sm font-medium">
              {ao.isLoading
                ? "Loading..."
                : ao.data
                  ? ao.data + " $AO"
                  : "Failed to fetch"}
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {}}>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Submit Your Feedback</p>
            <p className="text-xs text-muted-foreground">
              Help us improve by sharing your thoughts!
            </p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => disconnect()}
          className="w-full bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 rounded-lg cursor-pointer transition-colors"
        >
          <Unplug className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export interface Navbar09NavItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?: boolean;
  }>;
}
export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  logoHref?: string;
  navigationLinks?: Navbar09NavItem[];
  searchPlaceholder?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  notificationCount?: number;
  messageIndicator?: boolean;
  onNavItemClick?: (href: string) => void;
  onSearchSubmit?: (query: string) => void;
  onMessageClick?: () => void;
  onNotificationItemClick?: (item: string) => void;
  onUserItemClick?: (item: string) => void;
  onPublish?: () => void;
  isPublishing?: boolean;
}

const NavBar = React.forwardRef<HTMLElement, NavbarProps>(
  (
    {
      className,
      logo = <Logo />,
      notificationCount = 3,
      onNotificationItemClick,
      onPublish,
      isPublishing = false,
      ...props
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLElement>(null);
    const address = useWallet((state) => state.address);
    const walletType = useWallet((state) => state.type);
    const { theme, setTheme } = useTheme();

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLElement | null) => {
        containerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    return (
      <header
        ref={combinedRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60 px-4 md:px-6 **:no-underline",
          className,
        )}
        {...props}
      >
        <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between gap-3">
          {/* Left side - Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => e.preventDefault()}
              className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors cursor-pointer group"
            >
              <div className="text-xl transition-transform duration-200 group-hover:scale-105">
                {logo}
              </div>
              <span className="hidden font-bold text-lg sm:inline-block tracking-tight">
                metalinks
              </span>
            </button>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-muted/80 transition-colors"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <NotificationMenu
              notificationCount={notificationCount}
              onItemClick={onNotificationItemClick}
            />

            {/* Publish button */}
            {address && walletType && (
              <Button
                onClick={onPublish}
                disabled={isPublishing}
                className="hidden sm:flex items-center gap-2 rounded-full bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300 h-9 px-5 text-sm font-medium"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-3.5 w-3.5" />
                    <span>Publish</span>
                  </>
                )}
              </Button>
            )}

            {/* Wallet Connection */}
            {address && walletType ? (
              <UserButton address={address} />
            ) : (
              <Button size="sm" className="rounded-full h-9 px-4 font-medium">
                Connect
              </Button>
            )}
          </div>
        </div>
      </header>
    );
  },
);
export default NavBar;
