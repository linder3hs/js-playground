import type { ConsoleOutputType } from "@/components/console/types";
import type { RunRequest, RunnerEvent } from "./protocol";
import { serializeArgs } from "./serialize";

/**
 * Execution worker for the JS/TS playground.
 *
 * It receives already transpiled JavaScript, runs it with an injected
 * `console` and returns every call serialized. The timeout is imposed by the
 * client (`client.ts`) through `terminate()`: from in here there is no way to
 * interrupt an infinite loop.
 */

/**
 * The project tsconfig does not include the "webworker" lib (this is a Next
 * app on lib DOM), so only what this file uses from the scope is declared.
 */
interface WorkerScope {
  postMessage(message: unknown): void;
  onmessage: ((event: MessageEvent<RunRequest>) => void) | null;
  onunhandledrejection: ((event: PromiseRejectionEvent) => void) | null;
}

const ctx = self as unknown as WorkerScope;

const CONSOLE_LEVELS: ConsoleOutputType[] = [
  "log",
  "error",
  "warn",
  "info",
  "debug",
];

let entryCounter = 0;

function emit(event: RunnerEvent) {
  ctx.postMessage(event);
}

function makeConsole(runId: string) {
  const shim: Record<string, (...args: unknown[]) => void> = {};

  for (const level of CONSOLE_LEVELS) {
    shim[level] = (...args: unknown[]) => {
      const idPrefix = `${runId}_e${entryCounter++}`;
      emit({
        type: "console",
        runId,
        level,
        values: serializeArgs(args, idPrefix),
        stack: level === "error" ? captureCallerStack() : undefined,
      });
    };
  }

  // Common aliases that would otherwise throw ReferenceError.
  shim.trace = shim.debug;
  shim.dir = shim.log;
  shim.table = shim.log;

  return shim;
}

/** The user code's stack, without the worker's internal frames */
function captureCallerStack(): string | undefined {
  const stack = new Error().stack;
  if (!stack) return undefined;
  // The first 3 lines belong to this file, not to the executed code.
  return stack.split("\n").slice(3).join("\n");
}

async function run({ runId, code }: RunRequest) {
  const startedAt = Date.now();
  const console = makeConsole(runId);

  // Top-level await is enabled by wrapping the code in an async IIFE.
  const wrapped = `return (async () => {\n${code}\n})()`;

  try {
    const fn = new Function("console", wrapped) as (
      console: unknown
    ) => Promise<unknown>;
    await fn(console);
    emit({ type: "done", runId, durationMs: Date.now() - startedAt });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    emit({
      type: "console",
      runId,
      level: "error",
      values: serializeArgs([err], `${runId}_e${entryCounter++}`),
      stack: err.stack,
    });
    emit({ type: "done", runId, durationMs: Date.now() - startedAt });
  }
}

ctx.onmessage = (event: MessageEvent<RunRequest>) => {
  if (event.data?.type === "run") {
    void run(event.data);
  }
};

// Promises rejected without a catch inside the user's code.
ctx.onunhandledrejection = (event: PromiseRejectionEvent) => {
  const reason = event.reason;
  const err = reason instanceof Error ? reason : new Error(String(reason));
  emit({
    type: "crash",
    runId: "unhandled",
    message: `Uncaught (in promise) ${err.message}`,
    stack: err.stack,
  });
};
