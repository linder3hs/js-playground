import { useState, useCallback, useRef, useEffect } from "react";
import {
  ConsoleOutput,
  ConsoleOutputType,
  ConsoleState,
  ProcessedValue,
} from "@/components/console/types";
import { processConsoleValues } from "@/lib/utils/console-formatter";

// Values the console knows how to handle
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

// Unique id for console messages
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

  // Ref tracking whether the component is still mounted
  const isMounted = useRef(true);

  const [state, setState] = useState<ConsoleState>({
    outputs: [],
    selectedOutput: null,
    filter: initialFilter,
    isOpen: initiallyOpen,
    executingCode: false,
  });

  // Clear the console
  const clearConsole = useCallback(() => {
    if (!isMounted.current) return;

    setState((prev) => ({
      ...prev,
      outputs: [],
      selectedOutput: null,
    }));
  }, []);

  // Append a message to the console, guarding against failures
  const addOutput = useCallback(
    (type: ConsoleOutputType, args: ConsoleValue[], stack?: string) => {
      if (!isMounted.current) return;

      setState((prev) => {
        try {
          const id = generateId();

          // Make sure args is an array
          const safeArgs = Array.isArray(args) ? args : [args];

          // Turn the values into something renderable
          let processedValues: ProcessedValue[];
          try {
            // A type assertion bridges the mismatched types
            processedValues = processConsoleValues(safeArgs as never[], {
              maxDepth: 5,
              initialExpandLevel: 1,
              maxArrayChildrenDisplay: 100,
              maxObjectPropertiesDisplay: 100,
              detectCircular: true,
            });
          } catch (err) {
            // If processing fails, show a plain error
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

          // Build the new output entry
          const newOutput: ConsoleOutput = {
            id,
            type,
            timestamp: Date.now(),
            values: processedValues,
            rawValues: safeArgs,
            stack,
          };

          // Append to the list, capping the total
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
          // On error, return the previous state untouched
          return prev;
        }
      });
    },
    [maxOutputs]
  );

  /**
   * Appends an entry whose values arrive already serialized from the
   * execution worker. `addOutput` still exists for live values from the main
   * thread (errors raised by the runner itself).
   */
  const addProcessedOutput = useCallback(
    (type: ConsoleOutputType, values: ProcessedValue[], stack?: string) => {
      if (!isMounted.current) return;

      setState((prev) => {
        const newOutput: ConsoleOutput = {
          id: generateId(),
          type,
          timestamp: Date.now(),
          values,
          rawValues: [],
          stack,
        };

        return {
          ...prev,
          outputs: [newOutput, ...prev.outputs].slice(0, maxOutputs),
        };
      });
    },
    [maxOutputs]
  );

  // Change the console filter
  const setFilter = useCallback((filter: ConsoleOutputType | "all") => {
    if (!isMounted.current) return;

    setState((prev) => ({
      ...prev,
      filter,
    }));
  }, []);

  // Open or close the console
  const toggleConsole = useCallback(() => {
    if (!isMounted.current) return;

    setState((prev) => ({
      ...prev,
      isOpen: !prev.isOpen,
    }));
  }, []);

  // Set the selected message
  const selectOutput = useCallback((id: string | null) => {
    if (!isMounted.current) return;

    setState((prev) => ({
      ...prev,
      selectedOutput: id,
    }));
  }, []);

  // Set the code execution state
  const setExecutingCode = useCallback((executing: boolean) => {
    if (!isMounted.current) return;

    setState((prev) => ({
      ...prev,
      executingCode: executing,
    }));
  }, []);

  // Get the filtered messages
  const getFilteredOutputs = useCallback(() => {
    if (state.filter === "all") {
      return state.outputs;
    }

    return state.outputs.filter((output) => output.type === state.filter);
  }, [state.outputs, state.filter]);

  // Drop references when the component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    consoleState: state,
    filteredOutputs: getFilteredOutputs(),
    addOutput,
    addProcessedOutput,
    clearConsole,
    setFilter,
    toggleConsole,
    selectOutput,
    setExecutingCode,
  };
}
