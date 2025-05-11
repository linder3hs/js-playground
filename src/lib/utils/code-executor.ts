import { ConsoleOutputType } from "@/components/console/types";
import { ConsoleFunction } from "@/hooks/use-editor";

// Define un tipo para valores que pueden ser utilizados en la consola
type LogArgument =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  | ConsoleFunction
  | Date
  | RegExp
  | Error
  | Promise<unknown>
  | Map<string | number | symbol, unknown>
  | Set<unknown>
  | readonly unknown[]
  | Record<string, unknown>
  | object;

// Tipo para resultados del código ejecutado
type ExecutionResult = {
  error?: boolean;
  message?: string;
  stack?: string;
  [key: string]: unknown;
};

interface CustomConsole {
  log: (...args: LogArgument[]) => void;
  error: (...args: LogArgument[]) => void;
  warn: (...args: LogArgument[]) => void;
  info: (...args: LogArgument[]) => void;
  debug: (...args: LogArgument[]) => void;
}

class ExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExecutionError";
  }
}

/**
 * Crea un método de consola que preserva los tipos originales
 */
const createConsoleMethod = (
  type: ConsoleOutputType,
  onOutput: (
    type: ConsoleOutputType,
    args: LogArgument[],
    stack?: string
  ) => void
) => {
  return (...args: LogArgument[]): void => {
    // Capturar el stack trace para errores
    let stack: string | undefined;
    if (type === "error") {
      // Crear un error para obtener el stack trace
      const err = new Error();
      stack = err.stack;

      // Solo nos interesa la parte del stack que muestra la ubicación de la llamada
      if (stack) {
        // Dividir por líneas y eliminar las primeras que son internas de nuestro código
        const stackLines = stack.split("\n");
        // Normalmente, las 2 primeras líneas son de nuestro sistema, no del código del usuario
        stack = stackLines.slice(2).join("\n");
      }
    }

    // Enviamos los argumentos originales, preservando sus tipos
    onOutput(type, [...args], stack);
  };
};

/**
 * Ejecuta código JavaScript con consola mejorada que preserva tipos
 */
export const executeCode = async (
  code: string,
  onOutput: (
    type: ConsoleOutputType,
    args: LogArgument[],
    stack?: string
  ) => void
): Promise<unknown> => {
  // Crear el entorno seguro para ejecutar el código
  try {
    // Crear objeto console personalizado
    const customConsole: CustomConsole = {
      log: createConsoleMethod("log", onOutput),
      error: createConsoleMethod("error", onOutput),
      warn: createConsoleMethod("warn", onOutput),
      info: createConsoleMethod("info", onOutput),
      debug: createConsoleMethod("debug", onOutput),
    };

    // Inyectar las funciones de consola en el código
    const secureCode = `
      (async function() {
        // Asegurar que la consola siempre está disponible
        const console = {
          log: customConsole.log,
          error: customConsole.error,
          warn: customConsole.warn,
          info: customConsole.info,
          debug: customConsole.debug
        };

        try {
          ${code}
        } catch (error) {
          console.error(error);
          return {
            error: true,
            message: error.message,
            stack: error.stack
          };
        }
      })()
    `;

    // Crear una función segura que ejecute el código
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const secureFunction = new Function("customConsole", secureCode) as (
      customConsole: CustomConsole
    ) => Promise<ExecutionResult | unknown>;

    // Ejecutar y capturar el resultado
    const result = await secureFunction(customConsole);

    // Comprobar si el resultado es un error
    if (
      result !== null &&
      typeof result === "object" &&
      Object.prototype.hasOwnProperty.call(result, "error") &&
      (result as ExecutionResult).error === true
    ) {
      const errorResult = result as ExecutionResult;
      throw new Error(
        errorResult.message || "Error en la ejecución del código"
      );
    }

    // Devolver el resultado
    return result;
  } catch (error) {
    // Error durante la ejecución
    if (error instanceof Error) {
      onOutput("error", [error], error.stack);
      throw new ExecutionError(error.message);
    } else {
      const unknownError = new Error("Unknown error during execution");
      onOutput("error", [unknownError], unknownError.stack);
      throw new ExecutionError("Unknown error during execution");
    }
  }
};
