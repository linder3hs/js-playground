/**
 * Value types JSON can hold
 */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSONValue }
  | JSONValue[];

/**
 * Node types in the JSON tree
 */
export type JSONNodeType =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "object"
  | "array";

/**
 * Interface for a node in the JSON tree structure
 */
export interface JSONNode {
  /** Key on the parent; empty string at the root when the JSON is a scalar */
  key: string;
  value: JSONValue;
  type: JSONNodeType;
  depth: number;
  /** JSON Pointer (RFC 6901): identifies the node unambiguously */
  path: string;
  /** Entries in the container; undefined for scalars */
  size?: number;
}

/**
 * Format JSON string with specified indentation
 * @param jsonString - The JSON string to format
 * @param spaces - Number of spaces for indentation (default: 2)
 * @returns Formatted JSON string or error message
 */
export function formatJSON(
  jsonString: string,
  spaces: number = 2
): {
  formatted: string | null;
  error: string | null;
} {
  try {
    // Parse the JSON string to an object
    const obj: JSONValue = JSON.parse(jsonString);

    // Convert back to a formatted string with the specified indentation
    const formatted = JSON.stringify(obj, null, spaces);

    return {
      formatted,
      error: null,
    };
  } catch (error) {
    return {
      formatted: null,
      error: error instanceof Error ? error.message : "Invalid JSON",
    };
  }
}

/**
 * Determine the type of a JSON value
 * @param value - The value to check
 * @returns The value's type as a JSONNodeType
 */
function getJSONType(value: JSONValue): JSONNodeType {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value as JSONNodeType;
}

/**
 * Escapes a JSON Pointer segment (RFC 6901). The tree used to build
 * `parent.key`, so `{"a.b": 1}` and `{"a": {"b": 2}}` shared a path and
 * expanding one expanded the other.
 */
function pointerSegment(key: string): string {
  return key.replace(/~/g, "~0").replace(/\//g, "~1");
}

/**
 * Builds **a single level** of the tree. Children are requested on expand, so
 * opening a large JSON no longer materializes every node on each keystroke;
 * you only pay for what you look at.
 */
export function buildJSONTree(
  value: JSONValue,
  parent: string = "",
  depth: number = 0
): JSONNode[] {
  // A valid JSON can be a scalar: `42`, `"hi"`, `true`. That used to return an
  // empty tree, and the view claimed there was nothing to show.
  if (value === null || typeof value !== "object") {
    return depth === 0
      ? [{ key: "", value, type: getJSONType(value), depth, path: "" }]
      : [];
  }

  const entries = value as { [key: string]: JSONValue };

  return Object.keys(entries).map((key) => {
    const child = entries[key];
    const type = getJSONType(child);
    const isContainer = child !== null && typeof child === "object";

    return {
      key,
      value: child,
      type,
      depth,
      path: `${parent}/${pointerSegment(key)}`,
      // Empty containers keep `size: 0`: the view painted them as a red
      // `null` because it could not tell "no children" from "scalar".
      size: isContainer ? Object.keys(child as object).length : undefined,
    };
  });
}

/**
 * Get a syntax-highlighted class name based on the data type
 * @param value - The value to check
 * @returns CSS class name for styling
 */
export function getValueStyle(value: JSONValue): string {
  if (value === null) return "text-red-600 dark:text-red-400";

  switch (typeof value) {
    case "string":
      return "text-emerald-600 dark:text-emerald-400";
    case "number":
      return "text-blue-600 dark:text-blue-400";
    case "boolean":
      return "text-amber-600 dark:text-amber-400";
    default:
      return "text-zinc-600 dark:text-zinc-400";
  }
}

/**
 * Format a value for display in the JSON tree
 * @param value - The value to format
 * @returns Formatted string representation
 */
export function formatValueForDisplay(value: JSONValue): string {
  if (value === null) return "null";
  if (typeof value === "string") return `"${value}"`;
  return String(value);
}
