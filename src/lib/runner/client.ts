import type { RunnerEvent } from "./protocol";

export interface CodeRunnerOptions {
  /** Ms before the run counts as hung and the worker is killed */
  timeoutMs?: number;
}

/**
 * Owns the execution worker's lifecycle.
 *
 * A worker is reused across runs. If a new run arrives while another is in
 * flight, the previous one is killed: that is what makes running on every
 * typing pause safe.
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

  /** Runs transpiled JS. Cancels the previous run if it is still alive. */
  run(code: string): string {
    if (this.activeRunId) this.kill();

    const runId = `run_${++this.runCounter}`;
    this.activeRunId = runId;

    const worker = this.ensureWorker();
    this.timer = setTimeout(() => this.onTimeout(runId), this.timeoutMs);
    worker.postMessage({ type: "run", runId, code });

    return runId;
  }

  /** Releases the worker. Call on unmount. */
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

      // A cancelled run can still post: the message is dropped.
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

  /** Kills the in-flight worker: the only way to break an infinite loop. */
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
