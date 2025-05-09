import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
      className="h-5 w-5 rounded-full"
    >
      {/* {theme === "light" ? ( */}
        <Sun className="h-3 w-3 transition-all" />
    {/* //   ) : (
    //     <Moon className="h-3 w-3 transition-all" />
    //   )} */}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
