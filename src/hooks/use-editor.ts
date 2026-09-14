import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import type { Monaco } from "@monaco-editor/react";
import {
  FILE_BY_LANGUAGE,
  useEditorStore,
  type PlaygroundLanguage,
} from "@/store/editor-store";
import { useConsole } from "@/hooks/use-console";
import { CodeRunner } from "@/lib/runner/client";
import type { RunnerEvent } from "@/lib/runner/protocol";
import {
  compileModel,
  configureLanguageDefaults,
  type Problem,
} from "@/lib/runner/compile";
import type { MonacoEditor } from "@/lib/types";

/** Typing pause before auto-run fires */
const AUTORUN_DEBOUNCE_MS = 700;

export function useEditor() {
  const {
    files,
    currentFile,
    updateFile,
    config,
    orientation,
    autoRun,
    setAutoRun,
    setLanguage: setStoreLanguage,
    setOrientation,
  } = useEditorStore();

  const language: PlaygroundLanguage =
    currentFile === FILE_BY_LANGUAGE.typescript ? "typescript" : "javascript";
  const code = files[currentFile] ?? "";

  const { resolvedTheme } = useTheme();
  const [isExecuting, setIsExecuting] = useState(false);
  /** Monaco loads from a CDN: until it mounts there is no model to compile */
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);

  const editorRef = useRef<MonacoEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const runnerRef = useRef<CodeRunner | null>(null);

  const {
    consoleState,
    filteredOutputs,
    addProcessedOutput,
    clearConsole,
    setFilter,
    selectOutput,
    setExecutingCode,
  } = useConsole({ initiallyOpen: true });

  // Handlers in refs: the worker outlives any render.
  const handleRunnerEvent = useRef<(event: RunnerEvent) => void>(() => {});
  handleRunnerEvent.current = (event: RunnerEvent) => {
    switch (event.type) {
      case "console":
        addProcessedOutput(event.level, event.values, event.stack);
        break;
      case "done":
        setIsExecuting(false);
        setExecutingCode(false);
        break;
      case "crash":
        addProcessedOutput(
          "error",
          [
            {
              type: "error",
              value: event.message,
              preview: event.message,
              hasChildren: false,
              depth: 0,
              path: `crash_${Date.now()}`,
              id: `crash_${Date.now()}`,
            },
          ],
          event.stack
        );
        setIsExecuting(false);
        setExecutingCode(false);
        break;
    }
  };

  const getRunner = useCallback(() => {
    if (!runnerRef.current) {
      runnerRef.current = new CodeRunner((event) =>
        handleRunnerEvent.current(event)
      );
    }
    return runnerRef.current;
  }, []);

  useEffect(() => {
    return () => {
      runnerRef.current?.dispose();
      runnerRef.current = null;
    };
  }, []);

  /**
   * Compiles and runs the current model.
   *
   * @param silent true for auto-run: on errors it simply does not run, instead
   * of writing to the console on every keystroke.
   */
  const execute = useCallback(
    async (silent: boolean) => {
      const monaco = monacoRef.current;
      const model = editorRef.current?.getModel();
      if (!monaco || !model) return;
      if (!model.getValue().trim()) {
        setProblems([]);
        return;
      }

      let result;
      try {
        result = await compileModel(monaco, model);
      } catch {
        // The TS worker is not ready yet: the next keystroke retries.
        return;
      }

      setProblems(result.problems);

      if (result.blocking.length > 0 || !result.js) {
        if (!silent) {
          const first = result.blocking[0];
          const message = first
            ? `${first.message} (line ${first.line})`
            : "Nothing to run";
          addProcessedOutput("error", [
            {
              type: "error",
              value: message,
              preview: message,
              hasChildren: false,
              depth: 0,
              path: `compile_${Date.now()}`,
              id: `compile_${Date.now()}`,
            },
          ]);
        }
        return;
      }

      clearConsole();
      setIsExecuting(true);
      setExecutingCode(true);
      getRunner().run(result.js);
    },
    [addProcessedOutput, clearConsole, getRunner, setExecutingCode]
  );

  // Stable ref for the keyboard shortcut, which is registered only once.
  const executeRef = useRef(execute);
  executeRef.current = execute;

  const runCode = useCallback(() => executeRef.current(false), []);

  // Auto-run: one execution per typing pause, not one per keystroke.
  // `isEditorReady` in the dependencies is what triggers the first run: on
  // mount, the debounce elapses before the model exists.
  useEffect(() => {
    if (!autoRun || !isEditorReady) return;
    const timer = setTimeout(() => {
      void executeRef.current(true);
    }, AUTORUN_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [code, language, autoRun, isEditorReady]);

  const handleEditorDidMount = useCallback(
    (editor: MonacoEditor, monaco: Monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      configureLanguageDefaults(monaco);
      setIsEditorReady(true);

      editor.addAction({
        id: "run-code",
        label: "Run Code",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
        run: () => {
          void executeRef.current(false);
        },
      });
    },
    []
  );

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      updateFile(currentFile, value ?? "");
    },
    [currentFile, updateFile]
  );

  const setLanguage = useCallback(
    (next: PlaygroundLanguage) => {
      setStoreLanguage(next);
      setProblems([]);
    },
    [setStoreLanguage]
  );

  return {
    code,
    config,
    /** The editor follows the site theme (the navbar holds the toggle) */
    editorTheme: (resolvedTheme === "light" ? "light" : "dark") as
      | "light"
      | "dark",
    language,
    orientation,
    autoRun,
    isExecuting,
    problems,
    consoleState,
    consoleOutputs: filteredOutputs,
    updateFile: handleEditorChange,
    runCode,
    setLanguage,
    setAutoRun,
    setOrientation,
    clearConsole,
    handleEditorDidMount,
    setConsoleFilter: setFilter,
    selectConsoleOutput: selectOutput,
  };
}
