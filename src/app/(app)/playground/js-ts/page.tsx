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

  return (
    <main className={`min-h-screen bg-background flex flex-col`}>
      <div className="flex-1 overflow-hidden">
        <Workspace />
      </div>
    </main>
  );
}
