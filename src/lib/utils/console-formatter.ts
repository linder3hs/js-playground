import type {
  ProcessedValue,
  ValueType,
  ConsoleFormatterOptions,
} from "@/components/console/types";

export type ConsoleValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | symbol
  | bigint
  | object;

let circularReferences: WeakMap<object, string>;

let valueIdCounter = 0;
const getNextValueId = () => `val_${valueIdCounter++}`;

export function detectValueType(value: unknown): ValueType {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  const type = typeof value;

  if (
    type === "string" ||
    type === "number" ||
    type === "boolean" ||
    type === "symbol" ||
    type === "bigint"
  ) {
    return type as ValueType;
  }

  if (type === "function") return "function";

  // Detect special objects
  if (value instanceof Date) return "date";
  if (value instanceof RegExp) return "regexp";
  if (value instanceof Error) return "error";
  if (value instanceof Promise) return "promise";
  if (value instanceof Map) return "map";
  if (value instanceof Set) return "set";
  if (Array.isArray(value)) return "array";

  return "object";
}

/**
 * Formats a value into a preview string
 */
export function formatValuePreview(value: unknown, type: ValueType): string {
  switch (type) {
    case "string": {
      // Single quotes and real escapes: the output reads as a literal that
      // can be pasted back into code. Line breaks used to be replaced with
      // "<br>", which rendered verbatim.
      const raw = value as string;
      const escaped = raw
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/\t/g, "\\t")
        .replace(/'/g, "\\'");
      return `'${
        escaped.length > 200 ? `${escaped.slice(0, 197)}...` : escaped
      }'`;
    }
    case "number":
      const numValue = value as number;
      return Number.isInteger(numValue)
        ? numValue.toString()
        : numValue.toFixed(10).replace(/\.?0+$/, "");
    case "boolean":
      return (value as boolean).toString();
    case "null":
      return "null";
    case "undefined":
      return "undefined";
    case "symbol":
      return (value as symbol).toString();
    case "bigint":
      return `${(value as bigint).toString()}n`;
    case "function":
      // Use a specific function type plus a runtime check
      if (typeof value === "function") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const funcStr = value.toString();
        const firstLine = funcStr.split("\n")[0];
        return firstLine.length > 60
          ? `${firstLine.substring(0, 57)}...`
          : firstLine;
      }
      return "[Function]";
    case "date":
      return (value as Date).toISOString();
    case "regexp":
      return (value as RegExp).toString();
    case "error":
      const err = value as Error;
      return `${err.name}: ${err.message}`;
    case "promise":
      return "[Promise]";
    case "array":
      return `Array(${(value as readonly unknown[]).length})`;
    case "map":
      return `Map(${(value as Map<string | number | symbol, unknown>).size})`;
    case "set":
      return `Set(${(value as Set<unknown>).size})`;
    case "object":
      const obj = value as object;
      const constructor = obj.constructor?.name;
      if (constructor && constructor !== "Object") {
        return `${constructor} {}`;
      }
      return "{}";
    case "circular":
      return "[Circular Reference]";
    default:
      return String(value);
  }
}

/**
 * Checks whether a value has children (expandable properties)
 */
export function hasChildren(value: unknown, type: ValueType): boolean {
  switch (type) {
    case "array":
      return Array.isArray(value) && (value as readonly unknown[]).length > 0;
    case "object":
      return (
        value !== null &&
        typeof value === "object" &&
        Object.keys(value as object).length > 0
      );
    case "map":
      return (
        value instanceof Map &&
        (value as Map<string | number | symbol, unknown>).size > 0
      );
    case "set":
      return value instanceof Set && (value as Set<unknown>).size > 0;
    case "error":
      const err = value as Error;
      return (
        value instanceof Error &&
        (Object.keys(err).length > 0 || err.stack !== undefined)
      );
    default:
      return false;
  }
}

/**
 * Counts how many children a value has
 */
export function countChildren(value: unknown, type: ValueType): number {
  switch (type) {
    case "array":
      return Array.isArray(value) ? (value as readonly unknown[]).length : 0;
    case "object":
      return value !== null && typeof value === "object"
        ? Object.keys(value as object).length
        : 0;
    case "map":
      return value instanceof Map
        ? (value as Map<string | number | symbol, unknown>).size
        : 0;
    case "set":
      return value instanceof Set ? (value as Set<unknown>).size : 0;
    case "error":
      const err = value as Error;
      return value instanceof Error
        ? Object.keys(err).length + (err.stack ? 1 : 0)
        : 0;
    default:
      return 0;
  }
}

/**
 * Processes nested objects for display in the console
 */
export function processValue(
  value: unknown,
  path = "root",
  depth = 0,
  key?: string | number,
  options: ConsoleFormatterOptions = {}
): ProcessedValue {
  // Options with their defaults
  const {
    maxDepth = 10,
    initialExpandLevel = 1,
    detectCircular = true,
  } = options;

  // To detect circular references
  if (detectCircular && typeof value === "object" && value !== null) {
    if (circularReferences.has(value as object)) {
      return {
        type: "circular",
        value: "[Circular Reference]",
        preview: "[Circular Reference]",
        depth,
        path: `${path}.circular`,
        key,
        id: getNextValueId(),
        hasChildren: false,
      };
    }
    circularReferences.set(value as object, path);
  }

  // Detect the value's type
  const type = detectValueType(value);

  // Compute the preview
  const preview = formatValuePreview(value, type);

  // Work out whether it has expandable children
  const valueHasChildren = hasChildren(value, type);

  // Work out whether it should start expanded
  const isExpanded = depth < initialExpandLevel && valueHasChildren;

  // Build the processed value
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processedValue: ProcessedValue = {
    type,
    value: valueHasChildren && depth >= maxDepth ? undefined : value, // any has to be allowed here
    preview,
    hasChildren: valueHasChildren,
    depth,
    path,
    key,
    id: getNextValueId(),
    isExpanded,
  };

  // Count children when needed
  if (valueHasChildren) {
    processedValue.childrenCount = countChildren(value, type);
  }

  return processedValue;
}

/**
 * Type representing Map entries
 */
type MapEntry = [unknown, unknown];

/**
 * Processes a complex value to get its children
 */
export function processChildren(
  parentValue: unknown,
  parentType: ValueType,
  parentPath: string,
  depth: number,
  options: ConsoleFormatterOptions = {}
): ProcessedValue[] {
  if (depth > (options.maxDepth || 10)) {
    return [];
  }

  const children: ProcessedValue[] = [];

  switch (parentType) {
    case "array":
      // For arrays, cap the number of items when there are too many
      if (!Array.isArray(parentValue)) return children;

      const arrayValue = parentValue as readonly unknown[];
      const maxArrayDisplay = options.maxArrayChildrenDisplay || 100;
      const arrayLength = arrayValue.length;
      const displayItems = Math.min(arrayLength, maxArrayDisplay);

      for (let i = 0; i < displayItems; i++) {
        const childPath = `${parentPath}[${i}]`;
        const child = processValue(
          arrayValue[i],
          childPath,
          depth + 1,
          i,
          options
        );
        children.push(child);
      }

      // If more items remain, show an indicator
      if (arrayLength > maxArrayDisplay) {
        children.push({
          type: "string",
          value: `... ${arrayLength - maxArrayDisplay} more items`,
          depth: depth + 1,
          path: `${parentPath}.more`,
          id: getNextValueId(),
        });
      }
      break;

    case "object":
      // For objects, read the properties
      if (parentValue === null || typeof parentValue !== "object")
        return children;

      const objValue = parentValue as Record<string, unknown>;
      const maxObjectProps = options.maxObjectPropertiesDisplay || 100;
      const keys = Object.keys(objValue);
      const displayProps = Math.min(keys.length, maxObjectProps);

      for (let i = 0; i < displayProps; i++) {
        const key = keys[i];
        const childPath = `${parentPath}.${key}`;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const childValue = objValue[key];
        const child = processValue(
          childValue,
          childPath,
          depth + 1,
          key,
          options
        );
        children.push(child);
      }

      // If more properties remain, show an indicator
      if (keys.length > maxObjectProps) {
        children.push({
          type: "string",
          value: `... ${keys.length - maxObjectProps} more properties`,
          depth: depth + 1,
          path: `${parentPath}.more`,
          id: getNextValueId(),
        });
      }
      break;

    case "map":
      // For Maps, turn them into entries
      if (!(parentValue instanceof Map)) return children;

      const mapValue = parentValue as Map<string | number | symbol, unknown>;
      const mapEntries = Array.from(mapValue.entries()) as MapEntry[];
      const maxMapEntries = options.maxObjectPropertiesDisplay || 100;
      const displayEntries = Math.min(mapEntries.length, maxMapEntries);

      for (let i = 0; i < displayEntries; i++) {
        const [mapKey, mapVal] = mapEntries[i];
        // Process the key
        const keyPath = `${parentPath}.key[${i}]`;
        const keyValue = processValue(
          mapKey,
          keyPath,
          depth + 1,
          `key ${i}`,
          options
        );

        // Process the value
        const valPath = `${parentPath}.val[${i}]`;
        const valValue = processValue(
          mapVal,
          valPath,
          depth + 1,
          `value ${i}`,
          options
        );

        children.push({
          type: "object",
          value: { key: keyValue, value: valValue },
          preview: `[Entry ${i}]`,
          hasChildren: true,
          childrenCount: 2,
          depth: depth + 1,
          path: `${parentPath}[${i}]`,
          id: getNextValueId(),
          key: i,
        });
      }
      break;

    case "set":
      // For Sets, turn them into an array
      if (!(parentValue instanceof Set)) return children;

      const setValue = parentValue as Set<unknown>;
      const setValues = Array.from(setValue.values());
      const maxSetValues = options.maxArrayChildrenDisplay || 100;
      const displayValues = Math.min(setValues.length, maxSetValues);

      for (let i = 0; i < displayValues; i++) {
        const childPath = `${parentPath}[${i}]`;
        const child = processValue(
          setValues[i],
          childPath,
          depth + 1,
          i,
          options
        );
        children.push(child);
      }
      break;

    case "error":
      // For errors, show properties and the stack
      if (!(parentValue instanceof Error)) return children;

      const errorValue = parentValue as Error;
      const errorKeys = Object.keys(errorValue);

      // Add the stack trace first
      if (errorValue.stack) {
        children.push({
          type: "string",
          value: errorValue.stack,
          preview: "stack",
          depth: depth + 1,
          path: `${parentPath}.stack`,
          key: "stack",
          id: getNextValueId(),
        });
      }

      // Add the remaining properties
      for (const key of errorKeys) {
        if (key !== "stack") {
          // The stack was added already
          const childPath = `${parentPath}.${key}`;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const childValue = errorValue[key as keyof Error];
          const child = processValue(
            childValue,
            childPath,
            depth + 1,
            key,
            options
          );
          children.push(child);
        }
      }
      break;
  }

  return children;
}

/**
 * Processes several values for console.log
 */
export function processConsoleValues(
  values: unknown[],
  options: ConsoleFormatterOptions = {}
): ProcessedValue[] {
  // Rather than trying to clear it, build a fresh WeakMap per invocation
  circularReferences = new WeakMap<object, string>();
  valueIdCounter = 0;

  return values.map((value, index) => {
    return processValue(value, `root[${index}]`, 0, index, options);
  });
}
