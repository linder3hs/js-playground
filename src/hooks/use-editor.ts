import { useState, useEffect, useCallback } from "react";
import { useEditorStore } from "@/store/editor-store";
import { executeCode } from "@/lib/utils/code-executor";
import { useConsole } from "@/hooks/use-console";
import { ConsoleOutputType } from "@/components/console/types";
import { Monaco } from "@monaco-editor/react";
import { MonacoEditor } from "@/web-playground/types";

export function useEditor() {
  const {
    files,
    currentFile,
    updateFile,
    config,
    orientation,
    activePanel,
    setOrientation,
    setActivePanel,
    updateConfig,
  } = useEditorStore();

  const [isExecuting, setIsExecuting] = useState(false);
  const [monacoEditor, setMonacoEditor] = useState<MonacoEditor | null>(null);
  const [monacoInstance, setMonacoInstance] = useState<Monaco | null>(null);

  // Usar el nuevo hook de consola
  const {
    consoleState,
    filteredOutputs,
    addOutput,
    clearConsole,
    toggleExpand,
    setFilter,
    toggleConsole,
    selectOutput,
    setExecutingCode,
    expandAllInOutput,
    collapseAllInOutput,
  } = useConsole({ initiallyOpen: true });

  // Ejecutar código con la nueva consola
  const runCode = useCallback(async () => {
    const code = files[currentFile];
    if (!code.trim()) return;

    setIsExecuting(true);
    setExecutingCode(true);
    clearConsole();

    try {
      await executeCode(
        code,
        (type: ConsoleOutputType, args: any[], stack?: string) => {
          addOutput(type, args, stack);
        }
      );
    } catch (error) {
      console.error("Error executing code:", error);
    } finally {
      setIsExecuting(false);
      setExecutingCode(false);
    }
  }, [files, currentFile, addOutput, clearConsole, setExecutingCode]);

  // Configurar el editor de Monaco
  const handleEditorDidMount = useCallback(
    (editor: MonacoEditor, monaco: Monaco) => {
      setMonacoEditor(editor);
      setMonacoInstance(monaco);

      // Configurar el tema y opciones
      monaco.editor.defineTheme("js-playground", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#1E1E1E",
          "editor.foreground": "#D4D4D4",
        },
      });

      monaco.editor.setTheme("js-playground");

      // Configurar atajos de teclado
      editor.addAction({
        id: "run-code",
        label: "Run Code",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
        run: runCode,
      });

      // Añadir tipos para console
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        `
      interface Console {
        log(...data: any[]): void;
        error(...data: any[]): void;
        warn(...data: any[]): void;
        info(...data: any[]): void;
        debug(...data: any[]): void;
      }
      declare const console: Console;
    `,
        "console.d.ts"
      );
    },
    [runCode]
  );

  // Actualizar el archivo actual
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        updateFile(currentFile, value);
      }
    },
    [currentFile, updateFile]
  );

  // Ejecutar código al iniciar si está vacío
  useEffect(() => {
    // Si no hay mensajes en la consola y tenemos código inicial, ejecutarlo
    if (filteredOutputs.length === 0 && files[currentFile]?.trim()) {
      runCode();
    }
  }, []);

  return {
    files,
    currentFile,
    orientation,
    activePanel,
    config,
    isExecuting,
    monacoEditor,
    monacoInstance,
    // Consola
    consoleState,
    consoleOutputs: filteredOutputs,
    // Métodos
    updateFile: handleEditorChange,
    runCode,
    clearConsole,
    setOrientation,
    setActivePanel,
    updateConfig,
    handleEditorDidMount,
    // Métodos de consola
    toggleConsoleExpand: toggleExpand,
    setConsoleFilter: setFilter,
    toggleConsolePanel: toggleConsole,
    selectConsoleOutput: selectOutput,
    expandAllInOutput,
    collapseAllInOutput,
  };
}
