import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";

const ThemeToggle = () => {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="relative w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Toggle theme"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {theme === "dark" ? (
          <Moon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
