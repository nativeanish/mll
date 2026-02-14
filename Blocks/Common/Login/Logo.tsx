import LogoSvg from "@/assets/Logo";

// Util Imports
import { cn } from "@/src/lib/utils";

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoSvg className="size-7" />
      <span className="text-lg font-bold tracking-tight">metalinks</span>
    </div>
  );
};

export default Logo;
