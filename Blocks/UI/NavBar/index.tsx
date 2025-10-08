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
import { Badge } from "@/src/components/ui/badge";
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
        variant="outline"
        size="icon"
        className="h-8 w-8 relative rounded-full"
      >
        <BellIcon size={16} />
        {notificationCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {notificationCount > 9 ? "9+" : notificationCount}
          </Badge>
        )}
        <span className="sr-only">Notifications</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-80">
      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onItemClick?.("notification1")}>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">New message received</p>
          <p className="text-xs text-muted-foreground">2 minutes ago</p>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.("notification2")}>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">System update available</p>
          <p className="text-xs text-muted-foreground">1 hour ago</p>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.("notification3")}>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">Weekly report ready</p>
          <p className="text-xs text-muted-foreground">3 hours ago</p>
        </div>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onItemClick?.("view-all")}>
        <Check />
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
  fetcher: (addr: string) => Promise<string>
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
          className="flex items-center gap-2 px-3 py-1.5 
             bg-green-100 dark:bg-green-900/30 
             rounded-sm hover:bg-green-200 
             dark:hover:bg-green-900/50"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <User className="w-4 h-4 text-green-700 dark:text-green-400" />
          <span className="text-xs text-green-600 dark:text-green-500 font-mono">
            {formatAddress(address)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuItem className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 font-mono">
          <div className="flex justify-between w-full items-center">
            <div className="flex items-center gap-2">
              <Wifi className="text-green-500" />
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
                            ?.denomination ?? 1
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
          className="w-full bg-[#b51820] text-white hover:bg-[#e3222c]"
        >
          <Unplug />
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
}

const NavBar = React.forwardRef<HTMLElement, NavbarProps>(
  (
    {
      className,
      logo = <Logo />,
      notificationCount = 3,
      onNotificationItemClick,
      ...props
    },
    ref
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
      [ref]
    );

    return (
      <header
        ref={combinedRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 [&_*]:no-underline",
          className
        )}
        {...props}
      >
        <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-6">
              <button
                onClick={(e) => e.preventDefault()}
                className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors cursor-pointer"
              >
                <div className="text-2xl">{logo}</div>
                <span className="hidden font-bold text-xl sm:inline-block">
                  metalinks
                </span>
              </button>
            </div>
          </div>
          {/* Right side */}
          <div className="flex flex-1 items-center justify-end gap-4">
            {/* Theme toggle */}
            <Button
              variant="outline"
              size="icon"
              className="relative h-8 w-8"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <div className="flex items-center gap-2">
              <NotificationMenu
                notificationCount={notificationCount}
                onItemClick={onNotificationItemClick}
              />
            </div>

            {/* Wallet Connection Status */}
            {address && walletType ? (
              <div className="flex items-center gap-2">
                <UserButton address={address} />
              </div>
            ) : (
              <Button size="sm">Connect</Button>
            )}
          </div>
        </div>
      </header>
    );
  }
);
export default NavBar;
