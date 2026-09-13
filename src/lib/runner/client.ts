import type { RunnerEvent } from "./protocol";

export interface CodeRunnerOptions {
  /** Ms antes de dar por colgado el run y matar el worker */
  timeoutMs?: number;
}

/**
 * Dueño del ciclo de vida del worker de ejecución.
 *
 * Un worker se reutiliza entre runs. Si llega un run nuevo con otro en vuelo,
 * el anterior se mata: es lo que hace seguro ejecutar en cada pausa de tecleo.
 */
export class CodeRunner {
  private worker: Worker | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private activeRunId: string | null = null;
  private runCounter = 0;
  private readonly timeoutMs: number;

  constructor(
    private readonly onEvent: (event: RunnerEvent) => void,
    options: CodeRunnerOptions = {}
  ) {
    this.timeoutMs = options.timeoutMs ?? 2000;
  }

  get isRunning(): boolean {
    return this.activeRunId !== null;
  }

  /** Ejecuta JS transpilado. Cancela el run anterior si sigue vivo. */
  run(code: string): string {
    if (this.activeRunId) this.kill();

    const runId = `run_${++this.runCounter}`;
    this.activeRunId = runId;

    const worker = this.ensureWorker();
    this.timer = setTimeout(() => this.onTimeout(runId), this.timeoutMs);
    worker.postMessage({ type: "run", runId, code });

    return runId;
  }

  /** Libera el worker. Llamar al desmontar. */
  dispose(): void {
    this.clearTimer();
    this.worker?.terminate();
    this.worker = null;
    this.activeRunId = null;
  }

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;

    const worker = new Worker(
      new URL("./runner.worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (event: MessageEvent<RunnerEvent>) => {
      const data = event.data;

      // Un run cancelado puede alcanzar a postear: se descarta.
      if (data.type !== "crash" && data.runId !== this.activeRunId) return;

      if (data.type === "done") {
        this.clearTimer();
        this.activeRunId = null;
      }

      this.onEvent(data);
    };

    worker.onerror = (event) => {
      const runId = this.activeRunId ?? "unknown";
      this.clearTimer();
      this.activeRunId = null;
      this.onEvent({
        type: "crash",
        runId,
        message: event.message || "Worker error",
      });
    };

    this.worker = worker;
    return worker;
  }

  /** Mata el worker en vuelo: única forma de cortar un bucle infinito. */
  private kill(): void {
    this.clearTimer();
    this.worker?.terminate();
    this.worker = null;
    this.activeRunId = null;
  }

  private onTimeout(runId: string): void {
    if (this.activeRunId !== runId) return;
    this.kill();
    this.onEvent({
      type: "crash",
      runId,
      message: `Execution timed out after ${this.timeoutMs}ms (possible infinite loop)`,
    });
  }

  private clearTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
}
