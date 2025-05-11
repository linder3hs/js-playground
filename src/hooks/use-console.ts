import { useState, useCallback, useRef, useEffect } from "react";
import {
  ConsoleOutput,
  ConsoleOutputType,
  ConsoleState,
  ProcessedValue,
} from "@/components/console/types";
import { processConsoleValues } from "@/lib/utils/console-formatter";

// Definición de tipo para valores que la consola puede manejar
export type ConsoleValue =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  | ((...args: unknown[]) => unknown)
  | Date
  | RegExp
  | Error
  | Promise<unknown>
  | Map<unknown, unknown>
  | Set<unknown>
  | unknown[]
  | Record<string, unknown>
  | object;

// Generar ID único para mensajes de consola
const generateId = (): string =>
  `console_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export interface UseConsoleOptions {
  maxOutputs?: number;
  initialFilter?: ConsoleOutputType | "all";
  initiallyOpen?: boolean;
}

export function useConsole(options: UseConsoleOptions = {}) {
  const {
    maxOutputs = 500,
    initialFilter = "all",
    initiallyOpen = true,
  } = options;

  // Ref para controlar si el componente sigue montado
  const isMounted = useRef(true);

  const [state, setState] = useState<ConsoleState>({
    outputs: [],
    expandedPaths: new Set<string>(),
    selectedOutput: null,
    filter: initialFilter,
    isOpen: initiallyOpen,
    executingCode: false,
  });

  // Limpiar la consola
  const clearConsole = useCallback(() => {
    if (!isMounted.current) return;

    setState((prev) => ({
      ...prev,
      outputs: [],
      expandedPaths: new Set(),
      selectedOutput: null,
    }));
  }, []);

  // Añadir un mensaje a la consola con manejo de errores
  const addOutput = useCallback(
    (type: ConsoleOutputType, args: ConsoleValue[], stack?: string) => {
      if (!isMounted.current) return;

      setState((prev) => {
        try {
          const id = generateId();

          // Validar que args es un array (por seguridad)
          const safeArgs = Array.isArray(args) ? args : [args];

          // Procesar valores para que sean renderizables
          let processedValues: ProcessedValue[];
          try {
            // Usamos type assertion para resolver la incompatibilidad de tipos
            processedValues = processConsoleValues(safeArgs as never[], {
              maxDepth: 5,
              initialExpandLevel: 1,
              maxArrayChildrenDisplay: 100,
              maxObjectPropertiesDisplay: 100,
              detectCircular: true,
            });
          } catch (err) {
            // Si falla el procesamiento, mostrar error simple
            console.error(
              "Error processing console values:",
              err instanceof Error ? err.message : "Unknown error"
            );

            processedValues = [
              {
                type: "error",
                value: "Error processing values",
                depth: 0,
                path: "root[0]",
                id: `error_${Date.now()}`,
              },
            ];
          }

          // Crear nuevo objeto de salida
          const newOutput: ConsoleOutput = {
            id,
            type,
            timestamp: Date.now(),
            values: processedValues,
            rawValues: safeArgs,
            stack,
          };

          // Añadir a la lista, limitando el número total
          const newOutputs = [newOutput, ...prev.outputs].slice(0, maxOutputs);

          return {
            ...prev,
            outputs: newOutputs,
          };
        } catch (error) {
          console.error(
            "Error adding console output:",
            error instanceof Error ? error.message : "Unknown error"
          );
          // En caso de error, devolver el estado anterior sin cambios
          return prev;
        }
      });
    },
    [maxOutputs]
  );

  // Alternar la expansión de un nodo
  const toggleExpand = useCallback((path: string) => {
    if (!path || !isMounted.current) return;

    setState((prev) => {
      const newExpandedPaths = new Set(prev.expandedPaths);

      if (newExpandedPaths.has(path)) {
        newExpandedPaths.delete(path);
      } else {
        newExpandedPaths.add(path);
      }

      return {
        ...prev,
        expandedPaths: newExpandedPaths,
      };
    });
  }, []);

  // Cambiar el filtro de la consola
  const setFilter = useCallback((filter: ConsoleOutputType | "all") => {
    if (!isMounted.current) return;

    setState((prev) => ({
      ...prev,
      filter,
    }));
  }, []);

  // Alternar la apertura/cierre de la consola
  const toggleConsole = useCallback(() => {
    if (!isMounted.current) return;

    setState((prev) => ({
      ...prev,
      isOpen: !prev.isOpen,
    }));
  }, []);

  // Establecer el mensaje seleccionado
  const selectOutput = useCallback((id: string | null) => {
    if (!isMounted.current) return;

    setState((prev) => ({
      ...prev,
      selectedOutput: id,
    }));
  }, []);

  // Establecer el estado de ejecución de código
  const setExecutingCode = useCallback((executing: boolean) => {
    if (!isMounted.current) return;

    setState((prev) => ({
      ...prev,
      executingCode: executing,
    }));
  }, []);

  // Obtener los mensajes filtrados
  const getFilteredOutputs = useCallback(() => {
    if (state.filter === "all") {
      return state.outputs;
    }

    return state.outputs.filter((output) => output.type === state.filter);
  }, [state.outputs, state.filter]);

  // Expandir todos los nodos de un mensaje
  const expandAllInOutput = useCallback((outputId: string) => {
    if (!outputId || !isMounted.current) return;

    setState((prev) => {
      const output = prev.outputs.find((o) => o.id === outputId);
      if (!output) return prev;

      const newExpandedPaths = new Set(prev.expandedPaths);

      // Función recursiva para añadir todas las rutas
      const addAllPaths = (values: ProcessedValue[]) => {
        values.forEach((value) => {
          if (value.hasChildren) {
            newExpandedPaths.add(value.path);
          }
        });
      };

      // Añadir todas las rutas principales del mensaje
      addAllPaths(output.values);

      return {
        ...prev,
        expandedPaths: newExpandedPaths,
      };
    });
  }, []);

  // Colapsar todos los nodos de un mensaje
  const collapseAllInOutput = useCallback((outputId: string) => {
    if (!outputId || !isMounted.current) return;

    setState((prev) => {
      const output = prev.outputs.find((o) => o.id === outputId);
      if (!output) return prev;

      const newExpandedPaths = new Set(prev.expandedPaths);

      // Eliminar todas las rutas que pertenecen a este mensaje
      output.values.forEach((value) => {
        // Extraer la parte raíz de la ruta
        const pathParts = value.path.split("[");
        const pathPrefix = pathParts[0];

        // Eliminar todas las rutas que comienzan con este prefijo
        newExpandedPaths.forEach((path) => {
          if (path.startsWith(pathPrefix)) {
            newExpandedPaths.delete(path);
          }
        });
      });

      return {
        ...prev,
        expandedPaths: newExpandedPaths,
      };
    });
  }, []);

  // Limpiar referencias cuando el componente se desmonta
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    consoleState: state,
    filteredOutputs: getFilteredOutputs(),
    addOutput,
    clearConsole,
    toggleExpand,
    setFilter,
    toggleConsole,
    selectOutput,
    setExecutingCode,
    expandAllInOutput,
    collapseAllInOutput,
  };
}
