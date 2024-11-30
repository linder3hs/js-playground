import { ConsoleOutput } from "@/lib/types";

type LogArgument =
  | string
  | number
  | boolean
  | null
  | undefined
  | object
  | bigint;
type ConsoleMethod = "log" | "error" | "warn" | "info";

interface CustomConsole {
  log: (...args: LogArgument[]) => void;
  error: (...args: LogArgument[]) => void;
  warn: (...args: LogArgument[]) => void;
  info: (...args: LogArgument[]) => void;
}

class ExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExecutionError";
  }
}

const formatConsoleArg = (arg: LogArgument): string => {
  if (typeof arg === "object" && arg !== null) {
    try {
      return JSON.stringify(arg, null, 2);
    } catch (err: unknown) {
      console.log(err);
      return "[Objeto Circular]";
    }
  }
  return String(arg);
};

const createConsoleMethod = (
  type: ConsoleMethod,
  onOutput: (output: Omit<ConsoleOutput, "timestamp">) => void
) => {
  return (...args: LogArgument[]): void => {
    onOutput({
      type,
      content: args.map(formatConsoleArg).join(" "),
    });
  };
};

export const executeCode = async (
  code: string,
  onOutput: (output: Omit<ConsoleOutput, "timestamp">) => void
): Promise<void> => {
  const customConsole: CustomConsole = {
    log: createConsoleMethod("log", onOutput),
    error: createConsoleMethod("error", onOutput),
    warn: createConsoleMethod("warn", onOutput),
    info: createConsoleMethod("info", onOutput),
  };

  try {
    const fn: (console: CustomConsole) => unknown = new Function(
      "console",
      code
    ) as (console: CustomConsole) => unknown;

    await Promise.resolve(fn(customConsole));
  } catch (error) {
    throw new ExecutionError(
      error instanceof Error
        ? error.message
        : "Error desconocido durante la ejecución"
    );
  }
};
