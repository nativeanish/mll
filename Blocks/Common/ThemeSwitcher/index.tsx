import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const root = window.document.documentElement;
    const initialTheme = root.classList.contains("light") ? "light" : "dark";
    setTheme(initialTheme);
  }, [setTheme]);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    const newTheme = theme === "light" ? "dark" : "light";

    root.classList.remove(theme);
    root.classList.add(newTheme);
    setTheme(newTheme);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-lg bg-background border-2 border-border shadow-[3px_3px_0px_var(--border)] hover:shadow-[5px_5px_0px_var(--border)] hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_var(--border)] transition-all duration-150"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}
