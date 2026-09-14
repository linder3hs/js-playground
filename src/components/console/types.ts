// A more specific type for functions
export type ConsoleFunction = (...args: unknown[]) => unknown;

// Values the console knows how to process
export type ConsoleValue =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  | ConsoleFunction // A specific type instead of Function
  | Date
  | RegExp
  | Error
  | Promise<unknown>
  | Map<unknown, unknown>
  | Set<unknown>
  | readonly unknown[] // More specific than Array<unknown>
  | Record<string, unknown>
  | object;
// Drop "unknown", which trips the no-explicit-any rule

export type ConsoleOutputType = "log" | "error" | "warn" | "info" | "debug";

export type ValueType =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "undefined"
  | "symbol"
  | "bigint"
  | "function"
  | "object"
  | "array"
  | "date"
  | "regexp"
  | "map"
  | "set"
  | "error"
  | "promise"
  | "circular";

export interface ProcessedValue {
  type: ValueType;
  // This really can be any value, so the eslint rule is disabled right
  // here instead of widening the type elsewhere
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  value: any; // any is unavoidable here, so it is spelled out on purpose
  preview?: string;
  hasChildren?: boolean;
  childrenCount?: number;
  depth: number;
  path: string;
  key?: string | number;
  id?: string;
  isExpanded?: boolean;
  /**
   * Already serialized children. The runner lives in a Web Worker: the page
   * side never sees the original object, so the whole tree travels up front
   * instead of being computed on expand.
   */
  children?: ProcessedValue[];
}

export interface ConsoleOutput {
  id: string;
  type: ConsoleOutputType;
  timestamp: number;
  values: ProcessedValue[];
  // The rule has to be disabled here too
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  rawValues: any[]; // any[] is unavoidable here
  stack?: string;
}

export interface ConsoleFormatterOptions {
  maxDepth?: number;
  initialExpandLevel?: number;
  maxArrayChildrenDisplay?: number;
  maxObjectPropertiesDisplay?: number;
  detectCircular?: boolean;
}

export interface ConsoleState {
  outputs: ConsoleOutput[];
  selectedOutput: string | null;
  filter: ConsoleOutputType | "all";
  isOpen: boolean;
  executingCode: boolean;
}
