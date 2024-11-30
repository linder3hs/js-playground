import { useRef } from "react";
import { Editor, OnMount } from "@monaco-editor/react";
import { useEditorStore } from "@/store/editor-store";

type MonacoEditor = Parameters<OnMount>[0];
type MonacoInstance = Parameters<OnMount>[1];

export const MonacoEditor = () => {
  const { files, currentFile, updateFile, config } = useEditorStore();
  const editorRef = useRef<MonacoEditor | null>(null);
  const monacoRef = useRef<MonacoInstance | null>(null);

  const configureTypeDefinitions = (monaco: MonacoInstance) => {
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
    });

    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      `
      interface Console {
        log(...data: unknown[]): void;
        error(...data: unknown[]): void;
        warn(...data: unknown[]): void;
        info(...data: unknown[]): void;
      }
      declare const console: Console;
      `,
      "ts:console.d.ts"
    );
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    configureTypeDefinitions(monaco);
  };

  return (
    <Editor
      height="100%"
      defaultLanguage="javascript"
      theme={config.theme}
      value={files[currentFile]}
      onChange={(value: string | undefined) =>
        updateFile(currentFile, value ?? "")
      }
      onMount={handleEditorDidMount}
      options={{
        ...config,
        automaticLayout: true,
        minimap: { enabled: config.minimap },
        fontSize: config.fontSize,
        lineNumbers: config.lineNumbers,
        wordWrap: config.wordWrap,
        tabSize: config.tabSize,
        scrollBeyondLastLine: false,
        formatOnPaste: true,
        formatOnType: true,
      }}
    />
  );
};
