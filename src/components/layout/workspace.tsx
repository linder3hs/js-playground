"use client";

import { EditorHeader } from "../editor/editor-header";
import { MonacoEditor } from "../editor/monaco-editor";
import { ConsolePanel } from "../console/ConsolePanel";
import { useEditor } from "@/hooks/use-editor";
import { toast } from "@/hooks/use-toast";
import { createShareableUrl } from "@/lib/utils/share";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export const Workspace = () => {
  const {
    code,
    config,
    editorTheme,
    language,
    setLanguage,
    autoRun,
    setAutoRun,
    problems,
    isExecuting,
    runCode,
    updateFile,
    handleEditorDidMount,
    orientation,
    setOrientation,
    clearConsole,
    consoleState,
    consoleOutputs,
    setConsoleFilter,
    selectConsoleOutput,
  } = useEditor();

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(createShareableUrl(code));
      toast({ title: "Link copied" });
    } catch {
      toast({
        title: "Couldn't copy the link",
        description: "Your browser blocked clipboard access.",
        variant: "destructive",
      });
    }
  };

  // Los de tipo bloquean en TypeScript; en JavaScript sólo la sintaxis.
  const blocking = problems.filter(
    (problem) => problem.syntactic || language === "typescript"
  );
  const firstProblem = blocking[0];

  return (
    <div className="flex h-screen flex-col bg-white text-zinc-900 dark:bg-[#0A0A0B] dark:text-zinc-100">
      <EditorHeader
        language={language}
        onLanguageChange={setLanguage}
        autoRun={autoRun}
        onAutoRunChange={setAutoRun}
        onRun={runCode}
        isRunning={isExecuting}
        onShare={handleShare}
        orientation={orientation}
        onToggleOrientation={() =>
          setOrientation(orientation === "horizontal" ? "vertical" : "horizontal")
        }
      />

      <ResizablePanelGroup direction={orientation} className="flex-1">
        <ResizablePanel defaultSize={60} minSize={25}>
          <MonacoEditor
            value={code}
            language={language}
            config={config}
            theme={editorTheme}
            onChange={updateFile}
            onMount={handleEditorDidMount}
          />
        </ResizablePanel>

        <ResizableHandle className="bg-zinc-200 transition-colors hover:bg-orange-500/60 dark:bg-zinc-800" />

        <ResizablePanel defaultSize={40} minSize={15}>
          <ConsolePanel
            outputs={consoleOutputs}
            allOutputs={consoleState.outputs}
            selectedOutput={consoleState.selectedOutput}
            filter={consoleState.filter}
            executingCode={consoleState.executingCode}
            autoRun={autoRun}
            onClear={clearConsole}
            onSetFilter={setConsoleFilter}
            onSelectOutput={selectConsoleOutput}
            className="h-full"
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Sólo aparece cuando hay algo que decir: el estado de ejecución ya lo
          comunica el punto naranja en la consola. */}
      {firstProblem && (
        <footer className="flex h-6 shrink-0 items-center gap-2 border-t border-zinc-200 px-3 text-[11px] dark:border-zinc-800">
          <span className="truncate text-red-600 dark:text-red-400">
            Line {firstProblem.line}: {firstProblem.message}
          </span>
          {blocking.length > 1 && (
            <span className="shrink-0 text-zinc-500">
              +{blocking.length - 1} more
            </span>
          )}
        </footer>
      )}

    </div>
  );
};
