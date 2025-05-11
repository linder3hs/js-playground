// Definir un tipo para valores que pueden ser procesados por la consola
export type ConsoleValue =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  | Function
  | Date
  | RegExp
  | Error
  | Promise<unknown>
  | Map<unknown, unknown>
  | Set<unknown>
  | Array<unknown>
  | Record<string, unknown>
  | object
  | unknown;

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
  value: ConsoleValue; // Reemplazado any con ConsoleValue
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
  rawValues: ConsoleValue[]; // Reemplazado any[] con ConsoleValue[]
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
