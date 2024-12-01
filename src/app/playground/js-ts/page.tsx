"use client";

import { useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Workspace } from "@/components/layout/workspace";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  // Prevenir la pérdida de cambios no guardados
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <main className={`min-h-screen bg-background flex flex-col`}>
        <Header />
        <div className="flex-1 overflow-hidden">
          <Workspace />
        </div>
      </main>
      <Toaster />
    </ThemeProvider>
  );
}
