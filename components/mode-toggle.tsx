"use client";

import { useTheme } from "next-themes";
import { useCallback } from "react";

import Icons from "@/components/icons";
import { Button } from "@/components/ui/button";

const ModeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <Button variant="ghost" className="size-8 px-0" onClick={toggleTheme}>
      <Icons.sun className="hidden size-4.5 dark:block" />
      <Icons.moon className="size-4.5 dark:hidden" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ModeToggle;
