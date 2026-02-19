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
        variant="outline"
        size="icon"
        className="h-9 w-9 relative rounded-lg bg-background border-2 border-border shadow-[2px_2px_0px_var(--border)] hover:shadow-[4px_4px_0px_var(--border)] hover:-translate-x-px hover:-translate-y-px active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0px_var(--border)] transition-all duration-150"
      >
        <BellIcon size={16} />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-sm bg-destructive text-[10px] font-black text-destructive-foreground border border-border shadow-[1px_1px_0px_var(--border)]">
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
             bg-nb-mint
             text-black
             border-2 border-border
             rounded-lg hover:bg-nb-teal
             shadow-[2px_2px_0px_var(--border)]
             hover:shadow-[4px_4px_0px_var(--border)]
             hover:-translate-x-px hover:-translate-y-px
             transition-all duration-150"
        >
          <div className="w-2 h-2 bg-nb-teal rounded-sm border border-border animate-pulse" />
          <User className="w-3.5 h-3.5 text-black" />
          <span className="text-xs text-black font-mono font-bold hidden sm:inline">
            {formatAddress(address)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-lg">
        <DropdownMenuItem className="bg-nb-mint text-foreground font-mono rounded-lg border-2 border-border shadow-[2px_2px_0px_var(--border)] mb-1">
          <div className="flex justify-between w-full items-center">
            <div className="flex items-center gap-2">
              <Wifi className="text-emerald-500" />
              <span className="font-mono text-black">Connected</span>
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
          className="w-full bg-destructive text-white hover:bg-destructive/80 rounded-lg cursor-pointer transition-colors font-bold border-2 border-border shadow-[2px_2px_0px_var(--border)]"
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
  showNotifications?: boolean;
  showPublishButton?: boolean;
}

const NavBar = React.forwardRef<HTMLElement, NavbarProps>(
  (
    {
      className,
      notificationCount = 3,
      onNotificationItemClick,
      onPublish,
      isPublishing = false,
      showNotifications = true,
      showPublishButton = true,
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
          "fixed top-0 left-0 right-0 z-50 border-b-2 border-border bg-background px-4 md:px-6 **:no-underline shadow-[0_4px_0px_var(--border)]",
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
              <span className="font-black text-lg tracking-tight uppercase bg-nb-yellow text-black px-2 py-0.5 border-2 border-border rounded-md shadow-[2px_2px_0px_var(--border)] group-hover:shadow-[3px_3px_0px_var(--border)] group-hover:-translate-x-px group-hover:-translate-y-px transition-all duration-150">
                <span className="sm:hidden">M</span>
                <span className="hidden sm:inline">metalinks</span>
              </span>
            </button>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg bg-background border-2 border-border shadow-[2px_2px_0px_var(--border)] hover:shadow-[4px_4px_0px_var(--border)] hover:-translate-x-px hover:-translate-y-px active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0px_var(--border)] transition-all duration-150"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {showNotifications && (
              <NotificationMenu
                notificationCount={notificationCount}
                onItemClick={onNotificationItemClick}
              />
            )}

            {/* Publish button */}
            {showPublishButton && address && walletType && (
              <Button
                onClick={onPublish}
                disabled={isPublishing}
                className="hidden sm:flex items-center gap-2 rounded-lg bg-primary text-primary-foreground border-2 border-border h-9 px-5 text-sm font-black uppercase tracking-wide shadow-[4px_4px_0px_var(--border)] hover:shadow-[6px_6px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_var(--border)] transition-all duration-150"
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
              <Button
                size="sm"
                className="rounded-lg h-9 px-4 font-black uppercase tracking-wide"
              >
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
