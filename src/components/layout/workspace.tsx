import { useState, useEffect } from "react";
import { MonacoEditor } from "../editor/monaco-editor";
import { EditorToolbar } from "../shared/EditorToolbar";
import { ConsolePanel } from "../console/ConsolePanel";
import { useEditor } from "@/hooks/use-editor";
import {
  Play,
  Save,
  Share2,
  RectangleHorizontal,
  RectangleVertical,
  Maximize,
  Minimize,
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export const Workspace = () => {
  const {
    orientation,
    setOrientation,
    activePanel,
    isExecuting,
    runCode,
    clearConsole,
    // Consola
    consoleState,
    consoleOutputs,
    // Métodos de consola
    toggleConsoleExpand,
    setConsoleFilter,
    toggleConsolePanel,
    selectConsoleOutput,
    expandAllInOutput,
    collapseAllInOutput,
  } = useEditor();

  // Estado para controlar si la consola está maximizada
  const [isConsoleMaximized, setIsConsoleMaximized] = useState(false);

  // Estado para controlar el tamaño de los paneles
  const [editorSize, setEditorSize] = useState(60);
  const [consoleSize, setConsoleSize] = useState(40);

  // Controlar layouts de los paneles
  const toggleOrientation = () => {
    setOrientation(orientation === "horizontal" ? "vertical" : "horizontal");
  };

  const toggleConsoleMaximize = () => {
    setIsConsoleMaximized(!isConsoleMaximized);
  };

  // Restablecer tamaños al cambiar orientación
  useEffect(() => {
    if (orientation === "horizontal") {
      setEditorSize(60);
      setConsoleSize(40);
    } else {
      setEditorSize(70);
      setConsoleSize(30);
    }
  }, [orientation]);

  // Gestionar tamaños durante maximización
  useEffect(() => {
    if (isConsoleMaximized) {
      setEditorSize(0);
      setConsoleSize(100);
    } else {
      if (orientation === "horizontal") {
        setEditorSize(60);
        setConsoleSize(40);
      } else {
        setEditorSize(70);
        setConsoleSize(30);
      }
    }
  }, [isConsoleMaximized]);

  // Definir acciones para la barra de herramientas
  const toolbarActions = [
    {
      id: "run",
      label: "Run",
      icon: <Play className="w-4 h-4 mr-2" />,
      onClick: runCode,
      tooltip: "Run your code",
      disabled: isExecuting,
    },
    {
      id: "layout",
      label: "",
      icon:
        orientation === "horizontal" ? (
          <RectangleHorizontal className="w-4 h-4" />
        ) : (
          <RectangleVertical className="w-4 h-4" />
        ),
      onClick: toggleOrientation,
      tooltip:
        orientation === "horizontal"
          ? "Switch to vertical layout"
          : "Switch to horizontal layout",
    },
    {
      id: "consoleMaximize",
      label: "",
      icon: isConsoleMaximized ? (
        <Minimize className="w-4 h-4" />
      ) : (
        <Maximize className="w-4 h-4" />
      ),
      onClick: toggleConsoleMaximize,
      tooltip: isConsoleMaximized ? "Restore console size" : "Maximize console",
    },
    {
      id: "share",
      label: "",
      icon: <Share2 className="w-4 h-4" />,
      onClick: () => {
        console.log("Share code");
      },
      tooltip: "Share your code",
    },
    {
      id: "save",
      label: "",
      icon: <Save className="w-4 h-4" />,
      onClick: () => {
        console.log("Save code");
      },
      tooltip: "Save your code",
    },
  ];


  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-950 text-gray-100">
      {/* Editor toolbar */}
      <EditorToolbar
        title={{ text: "JavaScript Playground" }}
        actions={toolbarActions}
        darkMode={true}
      />

      {/* Contenedor principal con paneles redimensionables */}
      <ResizablePanelGroup
        direction={orientation}
        className="flex-1 border-t border-gray-800 overflow-hidden"
        onLayout={(sizes) => {
          // Opcional: actualizar el estado con los tamaños cuando el usuario redimensiona
          if (sizes.length === 2) {
            setEditorSize(sizes[0]);
            setConsoleSize(sizes[1]);
          }
        }}
      >
        {/* Panel del editor - oculto si la consola está maximizada */}
        <ResizablePanel
          defaultSize={editorSize}
          minSize={isConsoleMaximized ? 0 : 30}
          className={isConsoleMaximized ? "hidden" : ""}
        >
          <div className="h-full border-r border-gray-800 bg-gray-950 overflow-hidden">
            <MonacoEditor />
          </div>
        </ResizablePanel>

        {/* Handle para redimensionar */}
        {!isConsoleMaximized && (
          <ResizableHandle
            withHandle
            className="bg-gray-800 hover:bg-gray-700 transition-colors"
          />
        )}

        {/* Panel de la consola */}
        <ResizablePanel
          defaultSize={consoleSize}
          minSize={isConsoleMaximized ? 100 : 20}
        >
          <div className="h-full bg-gray-950 overflow-hidden flex flex-col">
            <ConsolePanel
              outputs={consoleOutputs}
              expandedPaths={consoleState.expandedPaths}
              selectedOutput={consoleState.selectedOutput}
              filter={consoleState.filter}
              isOpen={true} // Siempre abierto en este diseño
              executingCode={consoleState.executingCode}
              onClear={clearConsole}
              onToggleExpand={toggleConsoleExpand}
              onSetFilter={setConsoleFilter}
              onToggleConsole={toggleConsolePanel}
              onSelectOutput={selectConsoleOutput}
              onExpandAll={expandAllInOutput}
              onCollapseAll={collapseAllInOutput}
              className="flex-1 border-l border-gray-800"
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Status bar con información adicional */}
      <div className="h-6 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-4 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>JavaScript</span>
          <span>Ln: 1, Col: 1</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>
            {orientation === "horizontal" ? "Horizontal" : "Vertical"} Layout
          </span>
          <span>{isExecuting ? "Running..." : "Ready"}</span>
        </div>
      </div>
    </div>
  );
};
