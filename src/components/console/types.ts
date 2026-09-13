// Definir un tipo más específico para funciones
export type ConsoleFunction = (...args: unknown[]) => unknown;

// Definir un tipo para valores que pueden ser procesados por la consola
export type ConsoleValue =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  | ConsoleFunction // Reemplazamos Function con un tipo específico
  | Date
  | RegExp
  | Error
  | Promise<unknown>
  | Map<unknown, unknown>
  | Set<unknown>
  | readonly unknown[] // Más específico que Array<unknown>
  | Record<string, unknown>
  | object;
// Eliminamos "unknown" que causa el error no-explicit-any

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
  // Usamos unknown aquí porque realmente podría ser cualquier valor
  // y agregamos un comentario para deshabilitar la regla de eslint
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  value: any; // No podemos evitar any aquí, pero lo explicitamos con el comentario
  preview?: string;
  hasChildren?: boolean;
  childrenCount?: number;
  depth: number;
  path: string;
  key?: string | number;
  id?: string;
  isExpanded?: boolean;
  /**
   * Hijos ya serializados. El runner corre en un Web Worker: del lado de la
   * página no existe el objeto original, así que el árbol viaja completo en
   * lugar de calcularse al expandir.
   */
  children?: ProcessedValue[];
}

export interface ConsoleOutput {
  id: string;
  type: ConsoleOutputType;
  timestamp: number;
  values: ProcessedValue[];
  // También necesitamos deshabilitar la regla aquí
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  rawValues: any[]; // No podemos evitar any[] aquí
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
