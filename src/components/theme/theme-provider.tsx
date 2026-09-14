"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

// Valid values for `attribute`, per the next-themes docs
type Attribute = "class" | "data-theme" | "data-mode";

// Spell the props out with concrete types
interface ThemeProviderProps {
  children: ReactNode;
  attribute?: Attribute | Attribute[] | undefined;
  defaultTheme?: string | undefined;
  enableSystem?: boolean | undefined;
  disableTransitionOnChange?: boolean | undefined;
  forcedTheme?: string | undefined;
  themes?: string[] | undefined;
  storageKey?: string | undefined;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
