import type { ConsoleOutputType } from "@/components/console/types";
import type { RunRequest, RunnerEvent } from "./protocol";
import { serializeArgs } from "./serialize";

/**
 * Worker de ejecución del playground JS/TS.
 *
 * Recibe JavaScript ya transpilado, lo corre con un `console` inyectado y
 * devuelve cada llamada serializada. El timeout lo impone el cliente
 * (`client.ts`) con `terminate()`: desde acá no hay forma de interrumpir un
 * bucle infinito.
 */

/**
 * El tsconfig del proyecto no incluye la lib "webworker" (es una app Next con
 * lib DOM), así que se declara sólo lo que este archivo usa del scope.
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

  // Alias comunes que de otro modo lanzarían ReferenceError.
  shim.trace = shim.debug;
  shim.dir = shim.log;
  shim.table = shim.log;

  return shim;
}

/** Stack del código del usuario, sin los frames internos del worker */
function captureCallerStack(): string | undefined {
  const stack = new Error().stack;
  if (!stack) return undefined;
  // Las 3 primeras líneas son de este archivo, no del código ejecutado.
  return stack.split("\n").slice(3).join("\n");
}

async function run({ runId, code }: RunRequest) {
  const startedAt = Date.now();
  const console = makeConsole(runId);

  // El await de nivel superior se habilita envolviendo en una IIFE async.
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

// Promesas rechazadas sin catch dentro del código del usuario.
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
