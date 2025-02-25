"use client";

import { useEffect, useRef, useState } from "react";

import {
  Editor,
  useMonaco,
  Monaco,
  OnMount,
} from "@monaco-editor/react";
import { useWebPlaygroundStore } from "@/store/web-playground-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Code2,
  Code,
  Eclipse,
  Play,
  Download,
  Copy,
  Maximize,
  Minimize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Definición de tipos
interface FileContent {
  content: string;
}

interface StoreFiles {
  html: FileContent;
  css: FileContent;
  javascript: FileContent;
}

interface WebPlaygroundStore {
  files: StoreFiles;
  updateFile: (
    fileType: "html" | "css" | "javascript",
    content: string
  ) => void;
}

interface LayoutConfig {
  direction: "horizontal" | "vertical";
  editorSize: number;
  previewSize: number;
}

interface MonacoModel {
  getValueInRange: (range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  }) => string;
  getLineContent: (lineNumber: number) => string;
}

interface MonacoPosition {
  lineNumber: number;
  column: number;
}

interface EmmetSuggestion {
  trigger: string;
  snippet: string;
}

interface MenuItem {
  label?: string;
  action?: () => void;
  icon?: string;
  type?: string;
}

type EditorWillMountHandler = (monaco: Monaco) => void;

type MonacoEditor = Parameters<OnMount>[0];

export function WebPlayground(): JSX.Element {
  // Acceso al store
  const { files, updateFile } = useWebPlaygroundStore() as WebPlaygroundStore;

  // Referencias y estados
  const previewRef = useRef<HTMLIFrameElement>(null);
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [editorFontSize] = useState<number>(14);
  const [previewLayout, setPreviewLayout] = useState<
    "split" | "bottom" | "right"
  >("right");

  // Hook para obtener la instancia de Monaco
  const monaco = useMonaco();

  // Configuración avanzada para el editor
  const editorWillMount: EditorWillMountHandler = (monaco) => {
    // Asegurar tema oscuro siempre
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#1E1E1E",
        "editor.foreground": "#D4D4D4",
        "editorCursor.foreground": "#AEAFAD",
        "editor.lineHighlightBackground": "#2D2D30",
        "editorLineNumber.foreground": "#858585",
        "editor.selectionBackground": "#264F78",
        "editor.inactiveSelectionBackground": "#3A3D41",
      },
    });
    monaco.editor.setTheme("custom-dark");

    // Configurar autocompletado mejorado
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      typeRoots: ["node_modules/@types"],
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: "React.createElement",
      lib: ["dom", "es2018"],
    });

    // Añadir definiciones de tipos para mejorar autocompletado
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      `
      interface Document {
        querySelector(selectors: string): Element | null;
        querySelectorAll(selectors: string): NodeListOf<Element>;
        getElementById(elementId: string): HTMLElement | null;
      }
      
      interface HTMLElement {
        innerHTML: string;
        style: CSSStyleDeclaration;
        classList: DOMTokenList;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
      }
      
      interface Window {
        addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
        localStorage: Storage;
        fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
      }
      
      declare const document: Document;
      declare const window: Window;
      declare const console: Console;
    `,
      "ts:dom.d.ts"
    );

    // Añadir librerías comunes para autocompletado
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      `
      declare namespace React {
        function createElement(type: any, props?: any, ...children: any[]): any;
        function useState<T>(initialState: T): [T, (newState: T) => void];
        function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
      }
      
      declare namespace ReactDOM {
        function render(element: any, container: Element | null): void;
      }
    `,
      "ts:react.d.ts"
    );
  };

  const handleEditorDidMount = (editor: MonacoEditor, monaco: Monaco): void => {
    // Crear menú contextual al estilo VS Code
    editor.onContextMenu((e: { event: { posx: number; posy: number } }) => {
      const containerDiv = document.createElement("div");
      containerDiv.className = "monaco-custom-context-menu";
      containerDiv.style.position = "fixed";
      containerDiv.style.left = `${e.event.posx}px`;
      containerDiv.style.top = `${e.event.posy}px`;
      containerDiv.style.backgroundColor = "#252526";
      containerDiv.style.border = "1px solid #454545";
      containerDiv.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
      containerDiv.style.zIndex = "10000";
      containerDiv.style.borderRadius = "3px";
      containerDiv.style.padding = "4px 0";
      containerDiv.style.minWidth = "180px";
      containerDiv.style.color = "#e2e2e2";
      containerDiv.style.fontSize = "13px";
      containerDiv.style.fontFamily =
        '-apple-system, inkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

      const menuItems: MenuItem[] = [
        {
          label: "Cut",
          action: () =>
            editor.getAction("editor.action.clipboardCutAction").run(),
          icon: "✂️",
        },
        {
          label: "Copy",
          action: () =>
            editor.getAction("editor.action.clipboardCopyAction").run(),
          icon: "📋",
        },
        {
          label: "Paste",
          action: () =>
            editor.getAction("editor.action.clipboardPasteAction").run(),
          icon: "📄",
        },
        { type: "separator" },
        {
          label: "Find",
          action: () => editor.getAction("actions.find").run(),
          icon: "🔍",
        },
        {
          label: "Replace",
          action: () =>
            editor.getAction("editor.action.startFindReplaceAction").run(),
          icon: "🔄",
        },
        { type: "separator" },
        {
          label: "Format Document",
          action: () => editor.getAction("editor.action.formatDocument").run(),
          icon: "🔧",
        },
        {
          label: "Command Palette",
          action: () => editor.getAction("editor.action.quickCommand").run(),
          icon: "⌨️",
        },
      ];

      menuItems.forEach((item) => {
        if (item.type === "separator") {
          const separator = document.createElement("div");
          separator.style.height = "1px";
          separator.style.margin = "4px 0";
          separator.style.backgroundColor = "#454545";
          containerDiv.appendChild(separator);
        } else if (item.label && item.action && item.icon) {
          const menuItem = document.createElement("div");
          menuItem.style.padding = "6px 12px";
          menuItem.style.cursor = "pointer";
          menuItem.style.display = "flex";
          menuItem.style.alignItems = "center";
          menuItem.onmouseover = () => {
            menuItem.style.backgroundColor = "#094771";
          };
          menuItem.onmouseout = () => {
            menuItem.style.backgroundColor = "transparent";
          };

          const iconSpan = document.createElement("span");
          iconSpan.style.marginRight = "8px";
          iconSpan.innerText = item.icon;

          const labelSpan = document.createElement("span");
          labelSpan.innerText = item.label;

          menuItem.appendChild(iconSpan);
          menuItem.appendChild(labelSpan);

          menuItem.onclick = () => {
            if (item.action) item.action();
            document.body.removeChild(containerDiv);
          };

          containerDiv.appendChild(menuItem);
        }
      });

      document.body.appendChild(containerDiv);

      // Cerrar el menú al hacer clic fuera
      const closeMenu = (evt: MouseEvent) => {
        if (!containerDiv.contains(evt.target as Node)) {
          document?.body?.removeChild(containerDiv);
          document?.removeEventListener("mousedown", closeMenu);
        }
      };

      // Cerrar el menú al presionar Escape
      const closeMenuOnEscape = (evt: KeyboardEvent) => {
        if (evt.key === "Escape" && document.body.contains(containerDiv)) {
          document.body.removeChild(containerDiv);
          document.removeEventListener("keydown", closeMenuOnEscape);
        }
      };

      document.addEventListener("mousedown", closeMenu);
      document.addEventListener("keydown", closeMenuOnEscape);
    });

    // Asegurarse de que el editor esté en tema oscuro
    monaco.editor.setTheme("custom-dark");

    // Añadir acciones de teclado adicionales similares a VS Code
    editor.addAction({
      id: "duplicate-line",
      label: "Duplicate Line",
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyD],
      run: (ed: any) => {
        ed.getAction("editor.action.copyLinesDownAction").run();
      },
    });

    // Acción para comentar líneas (Ctrl+/)
    editor.addAction({
      id: "toggle-comment",
      label: "Toggle Comment",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash],
      run: (ed: any) => {
        ed.getAction("editor.action.commentLine").run();
      },
    });
  };

  // Efectos para configurar Monaco globalmente y habilitar Emmet
  useEffect(() => {
    if (monaco) {
      // Simular comportamiento de Emmet en HTML
      monaco.languages.registerCompletionItemProvider("html", {
        triggerCharacters: [">"],
        provideCompletionItems: (
          model: MonacoModel,
          position: MonacoPosition
        ) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          // Si acaba de cerrar una etiqueta
          if (textUntilPosition.endsWith(">")) {
            const tagMatch = textUntilPosition.match(
              /<([a-zA-Z][a-zA-Z0-9]*)[^>]*>$/
            );
            if (tagMatch) {
              const tagName = tagMatch[1];
              // No cerrar etiquetas auto-cerradas
              const selfClosingTags = [
                "img",
                "input",
                "br",
                "hr",
                "meta",
                "link",
              ];
              if (!selfClosingTags.includes(tagName.toLowerCase())) {
                return {
                  suggestions: [
                    {
                      label: `</${tagName}>`,
                      kind: monaco.languages.CompletionItemKind.Snippet,
                      insertText: `\$0</${tagName}>`,
                      insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                          .InsertAsSnippet,
                      range: {
                        startLineNumber: position.lineNumber,
                        startColumn: position.column,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column,
                      },
                    },
                  ],
                };
              }
            }
          }
          return { suggestions: [] };
        },
      });

      // Configurar sugerencias para etiquetas en HTML
      monaco.languages.html.htmlDefaults.setOptions({
        format: {
          tabSize: 2,
          insertSpaces: true,
        },
        suggest: {
          html5: true,
        },
      });

      // Definir snippets personalizados para HTML
      monaco.languages.registerCompletionItemProvider("html", {
        provideCompletionItems: () => {
          return {
            suggestions: [
              {
                label: "html:5",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: [
                  "<!DOCTYPE html>",
                  '<html lang="en">',
                  "<head>",
                  '  <meta charset="UTF-8">',
                  '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
                  "  <title>${1:Document}</title>",
                  "</head>",
                  "<body>",
                  "  ${0}",
                  "</body>",
                  "</html>",
                ].join("\n"),
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "HTML5 template",
              },
              {
                label: "!",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: [
                  "<!DOCTYPE html>",
                  '<html lang="en">',
                  "<head>",
                  '  <meta charset="UTF-8">',
                  '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
                  "  <title>${1:Document}</title>",
                  "</head>",
                  "<body>",
                  "  ${0}",
                  "</body>",
                  "</html>",
                ].join("\n"),
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "HTML5 template (shorthand)",
              },
              {
                label: "div",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: '<div class="${1:className}">\n  ${0}\n</div>',
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Div with class",
              },
              {
                label: "div.className",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: '<div class="${1:className}">\n  ${0}\n</div>',
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Div with class (Emmet style)",
              },
              {
                label: "div#id",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: '<div id="${1:id}">\n  ${0}\n</div>',
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Div with ID (Emmet style)",
              },
              {
                label: "ul>li*3",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText:
                  "<ul>\n  <li>${1:Item 1}</li>\n  <li>${2:Item 2}</li>\n  <li>${3:Item 3}</li>\n</ul>${0}",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Unordered list with 3 items (Emmet style)",
              },
              {
                label: ".container",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: '<div class="container">\n  ${0}\n</div>',
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Container div (Emmet style)",
              },
            ],
          };
        },
      });

      // Definir snippets personalizados para CSS
      monaco.languages.registerCompletionItemProvider("css", {
        provideCompletionItems: () => {
          return {
            suggestions: [
              {
                label: "flex-center",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: [
                  "display: flex;",
                  "justify-content: center;",
                  "align-items: center;${0}",
                ].join("\n"),
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Flexbox centering",
              },
              {
                label: "flex",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: "display: flex;${0}",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Display flex",
              },
              {
                label: "grid",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText:
                  "display: grid;\ngrid-template-columns: ${1:repeat(3, 1fr)};\ngrid-gap: ${2:10px};${0}",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "CSS Grid layout",
              },
              {
                label: "media",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText:
                  "@media screen and (max-width: ${1:768px}) {\n  ${0}\n}",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Media query",
              },
              {
                label: "reset",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: [
                  "* {",
                  "  margin: 0;",
                  "  padding: 0;",
                  "  box-sizing: border-box;",
                  "}",
                  "",
                  "body {",
                  '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;',
                  "  line-height: 1.6;",
                  "}${0}",
                ].join("\n"),
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Simple CSS reset",
              },
            ],
          };
        },
      });

      // Definir snippets personalizados para JavaScript
      monaco.languages.registerCompletionItemProvider("javascript", {
        provideCompletionItems: () => {
          return {
            suggestions: [
              {
                label: "fe",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: [
                  "${1:array}.forEach((${2:item}) => {",
                  "  ${0}",
                  "});",
                ].join("\n"),
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "forEach loop with arrow function",
              },
              {
                label: "clg",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: "console.log(${1});${0}",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Console log (shorthand)",
              },
              {
                label: "func",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: "function ${1:name}(${2:params}) {\n  ${0}\n}",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Function declaration",
              },
              {
                label: "afes",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: "(${1:params}) => ${0}",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Arrow function (short)",
              },
              {
                label: "promise",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText:
                  "return new Promise((resolve, reject) => {\n  ${0}\n});",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Create a Promise",
              },
            ],
          };
        },
      });

      // Agregar detector de patrones Emmet para HTML
      monaco.languages.registerCompletionItemProvider("html", {
        triggerCharacters: [":", ".", ">", "#", "*", "+", "["],
        provideCompletionItems: (model: any, position: any) => {
          const lineContent = model.getLineContent(position.lineNumber);
          const wordUntilPosition = lineContent.substring(
            0,
            position.column - 1
          );

          // Detectar patrones tipo Emmet (ejemplos: div>, ul>li, div.class, div#id)
          const emmetMatch = wordUntilPosition.match(
            /([a-zA-Z0-9.#]+)([>+*]?)([a-zA-Z0-9]*)$/
          );

          if (emmetMatch) {
            // Lista de sugerencias basadas en patrones Emmet comunes
            const emmetSuggestions: EmmetSuggestion[] = [
              { trigger: "div>", snippet: "<div>\n  ${0}\n</div>" },
              {
                trigger: "div.",
                snippet: '<div class="${1:className}">\n  ${0}\n</div>',
              },
              {
                trigger: "div#",
                snippet: '<div id="${1:id}">\n  ${0}\n</div>',
              },
              { trigger: "ul>li", snippet: "<ul>\n  <li>${0}</li>\n</ul>" },
              { trigger: "ol>li", snippet: "<ol>\n  <li>${0}</li>\n</ol>" },
              { trigger: "a[href]", snippet: '<a href="${1:#}">${0}</a>' },
              {
                trigger: "img[src]",
                snippet: '<img src="${1:image.jpg}" alt="${2:description}">',
              },
            ];

            // Filtrar sugerencias que coincidan con el patrón ingresado
            const filteredSuggestions = emmetSuggestions.filter((item) => {
              return (
                item.trigger.startsWith(emmetMatch[0]) ||
                emmetMatch[0].startsWith(item.trigger.split(">")[0])
              );
            });

            return {
              suggestions: filteredSuggestions.map((item) => ({
                label: item.trigger,
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: item.snippet,
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: `Emmet: ${item.trigger}`,
                range: {
                  startLineNumber: position.lineNumber,
                  startColumn: position.column - emmetMatch[0].length,
                  endLineNumber: position.lineNumber,
                  endColumn: position.column,
                },
              })),
            };
          }

          return { suggestions: [] };
        },
      });
    }
  }, [monaco]);

  // Efecto para aplicar estilos personalizados para mejorar la experiencia
  useEffect(() => {
    // Agregar estilos personalizados para simular más capacidades de Emmet/VS Code
    const styleEl = document.createElement("style");
    styleEl.innerText = `
      /* Estilo para resaltar pares de etiquetas */
      .monaco-editor .bracket-match {
        background-color: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(0, 120, 215, 0.5);
      }
      
      /* Estilos para el cursor y selección */
      .monaco-editor .cursor {
        transition: opacity 0.2s ease-in-out;
      }
      
      /* Resaltado de etiquetas coincidentes */
      .monaco-editor .highlight-range {
        background-color: rgba(255, 255, 0, 0.1);
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      if (document.head.contains(styleEl)) {
        document.head.removeChild(styleEl);
      }
    };
  }, []);

  // Función para actualizar la vista previa
  const updatePreview = (): void => {
    if (!previewRef.current) return;

    const htmlContent = files.html.content;
    const cssContent = files.css.content;
    const jsContent = files.javascript.content;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* Reset CSS */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            }
            ${cssContent}
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>${jsContent}</script>
        </body>
      </html>
    `;

    previewRef.current.srcdoc = content;
  };

  // Efecto para actualizar la vista previa cuando cambia el código
  useEffect(() => {
    if (autoUpdate) {
      updatePreview();
    }
  }, [files, autoUpdate]);

  // Función para descargar el proyecto como archivo HTML
  const downloadProject = (): void => {
    const htmlContent = files.html.content;
    const cssContent = files.css.content;
    const jsContent = files.javascript.content;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Web Project</title>
          <style>
            ${cssContent}
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            ${jsContent}
          </script>
        </body>
      </html>
    `;

    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "web-project.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Función para copiar el código HTML completo al portapapeles
  const copyHtmlToClipboard = (): void => {
    const htmlContent = files.html.content;
    const cssContent = files.css.content;
    const jsContent = files.javascript.content;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Web Project</title>
          <style>
            ${cssContent}
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            ${jsContent}
          </script>
        </body>
      </html>
    `;

    navigator.clipboard.writeText(content);
  };

  // Función para alternar el modo de pantalla completa
  const toggleFullscreen = (): void => {
    setIsFullscreen(!isFullscreen);
  };

  // Función para obtener la configuración de diseño según el tipo de vista seleccionado
  const getLayoutConfig = (): LayoutConfig => {
    switch (previewLayout) {
      case "bottom":
        return {
          direction: "vertical",
          editorSize: 70,
          previewSize: 30,
        };
      case "right":
        return {
          direction: "horizontal",
          editorSize: 60,
          previewSize: 40,
        };
      default:
        return {
          direction: "horizontal",
          editorSize: 60,
          previewSize: 40,
        };
    }
  };

  const config: LayoutConfig = getLayoutConfig();

  // Renderizado del componente
  return (
    <div
      className={`${
        isFullscreen
          ? "fixed inset-0 z-50 bg-background"
          : "h-[calc(100vh-4rem)]"
      }`}
    >
      {/* Barra de herramientas superior */}
      <div className="flex items-center justify-between bg-background px-4 py-2 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Web Playground</h2>
          <div className="flex items-center gap-1">
            <Label htmlFor="auto-update" className="text-sm mr-1">
              Auto Update
            </Label>
            <Switch
              id="auto-update"
              checked={autoUpdate}
              onCheckedChange={setAutoUpdate}
            />
          </div>
          <div className="flex items-center gap-5">
            <Select
              value={previewLayout}
              onValueChange={(value: "split" | "bottom" | "right") =>
                setPreviewLayout(value)
              }
            >
              <SelectTrigger className="h-8 w-24">
                <SelectValue placeholder="Layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="split">Split</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={updatePreview}>
                  <Play className="w-4 h-4 mr-2" />
                  Run
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Run your code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={downloadProject}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download as HTML file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyHtmlToClipboard}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy HTML to clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4" />
                  ) : (
                    <Maximize className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Paneles redimensionables */}
      <ResizablePanelGroup direction={config.direction}>
        <ResizablePanel defaultSize={config.editorSize}>
          <Tabs defaultValue="html" className="h-full flex flex-col">
            <TabsList className="w-full justify-start gap-2 px-4 py-2 bg-background">
              <TabsTrigger value="html" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                HTML
              </TabsTrigger>
              <TabsTrigger value="css" className="flex items-center gap-2">
                <Eclipse className="w-4 h-4" />
                CSS
              </TabsTrigger>
              <TabsTrigger value="js" className="flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                JavaScript
              </TabsTrigger>
            </TabsList>

            {/* Editor HTML */}
            <TabsContent
              value="html"
              className="flex-1 p-0 m-0 border-none overflow-hidden"
            >
              <Editor
                height="100%"
                defaultLanguage="html"
                value={files.html.content}
                onChange={(value: string | undefined) =>
                  updateFile("html", value || "")
                }
                beforeMount={editorWillMount}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: true },
                  fontSize: editorFontSize,
                  lineNumbers: "on",
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  theme: "custom-dark",
                  wordWrap: "on",
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  tabSize: 2,
                  snippetSuggestions: "on",
                  suggestOnTriggerCharacters: true,
                  acceptSuggestionOnEnter: "on",
                  quickSuggestions: true,
                  contextmenu: true,
                  suggest: {
                    showKeywords: true,
                    showSnippets: true,
                    showMethods: true,
                    showFunctions: true,
                    showConstructors: true,
                    showFields: true,
                  },
                  acceptSuggestionOnCommitCharacter: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  cursorStyle: "line",
                  mouseWheelZoom: true,
                  smoothScrolling: true,
                  renderWhitespace: "none",
                  scrollBeyondLastColumn: 5,
                  folding: true,
                  fontFamily: "JetBrains Mono, 'Courier New', monospace",
                  bracketPairColorization: { enabled: true },
                  guides: {
                    bracketPairs: true,
                    indentation: true,
                    highlightActiveIndentation: true,
                  },
                }}
              />
            </TabsContent>

            {/* Editor CSS */}
            <TabsContent value="css" className="flex-1 p-0 m-0 overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="css"
                value={files.css.content}
                onChange={(value: string | undefined) =>
                  updateFile("css", value || "")
                }
                beforeMount={editorWillMount}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: true },
                  fontSize: editorFontSize,
                  lineNumbers: "on",
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  theme: "custom-dark",
                  wordWrap: "on",
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  tabSize: 2,
                  snippetSuggestions: "on",
                }}
              />
            </TabsContent>

            {/* Editor JavaScript */}
            <TabsContent value="js" className="flex-1 p-0 m-0 overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={files.javascript.content}
                onChange={(value: string | undefined) =>
                  updateFile("javascript", value || "")
                }
                beforeMount={editorWillMount}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: true },
                  fontSize: editorFontSize,
                  lineNumbers: "on",
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  theme: "custom-dark",
                  wordWrap: "on",
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  tabSize: 2,
                  snippetSuggestions: "on",
                }}
              />
            </TabsContent>
          </Tabs>
        </ResizablePanel>

        {/* Separador redimensionable */}
        <ResizableHandle withHandle />

        {/* Panel de vista previa */}
        <ResizablePanel defaultSize={config.previewSize}>
          <div className="h-full bg-background flex flex-col overflow-hidden border">
            <div className="bg-background px-4 py-2 border-b flex items-center justify-between">
              <h3 className="text-sm font-medium">Preview</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={updatePreview}
                  title="Refresh Preview"
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="w-full h-full bg-white relative">
              <iframe
                ref={previewRef}
                className="w-full h-full"
                title="preview"
                sandbox="allow-scripts"
              />
              {!autoUpdate && (
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none">
                  <Button
                    onClick={updatePreview}
                    className="pointer-events-auto"
                    variant="secondary"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Click to Run
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
