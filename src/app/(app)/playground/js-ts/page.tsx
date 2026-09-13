"use client";

import { useEffect } from "react";
import { Workspace } from "@/components/layout/workspace";

export default function Home() {
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

  // Workspace ya ocupa la altura completa; envolverlo en otro min-h-screen
  // sumaba una franja muerta al pie.
  return <Workspace />;
}
