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

  // Workspace already fills the viewport; wrapping it in another min-h-screen
  // added a dead strip at the bottom.
  return <Workspace />;
}
