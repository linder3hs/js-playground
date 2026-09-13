import type {
  ConsoleOutputType,
  ProcessedValue,
} from "@/components/console/types";

/** Mensaje que la página envía al worker */
export interface RunRequest {
  type: "run";
  runId: string;
  /** JavaScript ya transpilado (el worker no sabe de TypeScript) */
  code: string;
}

/** Mensajes que el worker envía de vuelta a la página */
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
