"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

// Opciones válidas para attribute según la documentación
type Attribute = "class" | "data-theme" | "data-mode";

// Define propiedades específicas con tipos concretos
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
