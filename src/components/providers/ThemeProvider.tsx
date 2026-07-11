"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useAppStore } from "@/lib/store/useAppStore";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  const { activePalette } = useAppStore();

  React.useEffect(() => {
    document.documentElement.setAttribute("data-palette", activePalette);
  }, [activePalette]);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
