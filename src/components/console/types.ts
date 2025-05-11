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
  value: any;
  preview?: string;
  hasChildren?: boolean;
  childrenCount?: number;
  depth: number;
  path: string;
  key?: string | number;
  id?: string;
  isExpanded?: boolean;
}

export interface ConsoleOutput {
  id: string;
  type: ConsoleOutputType;
  timestamp: number;
  values: ProcessedValue[];
  rawValues: any[];
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
  expandedPaths: Set<string>;
  selectedOutput: string | null;
  filter: ConsoleOutputType | "all";
  isOpen: boolean;
  executingCode: boolean;
}
