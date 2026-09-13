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
import type { MonacoEditor } from "@/web-playground/types";

/** Pausa de tecleo antes de disparar el auto-run */
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
  /** Monaco carga por CDN: hasta que monta no hay modelo que compilar */
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
    toggleExpand,
    setFilter,
    selectOutput,
    setExecutingCode,
  } = useConsole({ initiallyOpen: true });

  // Handlers en refs: el worker vive más que cualquier render.
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
   * Compila y ejecuta el modelo actual.
   *
   * @param silent true para el auto-run: con errores simplemente no ejecuta,
   * en lugar de escribir en la consola en cada tecla.
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
        // El worker de TS todavía no está listo: el próximo tecleo reintenta.
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

  // Ref estable para el atajo de teclado, que se registra una sola vez.
  const executeRef = useRef(execute);
  executeRef.current = execute;

  const runCode = useCallback(() => executeRef.current(false), []);

  // Auto-run: una ejecución por pausa de tecleo, no una por tecla.
  // `isEditorReady` en las dependencias es lo que dispara la primera ejecución:
  // al montar, el debounce vence antes de que exista el modelo.
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
    /** El editor sigue al tema del sitio (el navbar tiene el toggle) */
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
    toggleConsoleExpand: toggleExpand,
    setConsoleFilter: setFilter,
    selectConsoleOutput: selectOutput,
  };
}
