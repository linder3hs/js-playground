import type {
  ConsoleOutputType,
  ProcessedValue,
} from "@/components/console/types";

/** Message the page sends to the worker */
export interface RunRequest {
  type: "run";
  runId: string;
  /** Already transpiled JavaScript (the worker knows nothing about TypeScript) */
  code: string;
}

/** Messages the worker sends back to the page */
export type RunnerEvent =
  | {
      type: "console";
      runId: string;
      level: ConsoleOutputType;
      values: ProcessedValue[];
      stack?: string;
    }
  | {
      type: "done";
      runId: string;
      durationMs: number;
    }
  | {
      type: "crash";
      runId: string;
      message: string;
      stack?: string;
    };
