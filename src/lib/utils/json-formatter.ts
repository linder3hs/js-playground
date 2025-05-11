/**
 * Interface for a node in the JSON tree structure
 */
export interface JSONNode {
  key: string;
  value: any;
  type: string;
  depth: number;
  expanded: boolean;
  path: string;
  children?: JSONNode[];
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
    const obj = JSON.parse(jsonString);

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
 * Validate a JSON string
 * @param jsonString - The JSON string to validate
 * @returns Object with validation result
 */
export function validateJSON(jsonString: string): {
  valid: boolean;
  error: string | null;
} {
  try {
    JSON.parse(jsonString);
    return {
      valid: true,
      error: null,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid JSON",
    };
  }
}

/**
 * Convert a JSON object to a tree structure for display
 * @param obj - The JSON object to convert
 * @param parent - Parent path (for nested objects)
 * @param depth - Current depth level in the tree
 * @returns Array of JSONNode objects representing the tree
 */
export function buildJSONTree(
  obj: any,
  parent: string = "",
  depth: number = 0
): JSONNode[] {
  if (!obj || typeof obj !== "object") return [];

  return Object.keys(obj).map((key) => {
    const value = obj[key];
    const path = parent ? `${parent}.${key}` : key;
    const type = Array.isArray(value) ? "array" : typeof value;
    const isObject = value !== null && typeof value === "object";

    const node: JSONNode = {
      key,
      value: isObject ? null : value,
      type,
      depth,
      expanded: false,
      path,
    };

    if (isObject) {
      node.children = buildJSONTree(value, path, depth + 1);
    }

    return node;
  });
}

/**
 * Get a syntax-highlighted class name based on the data type
 * @param value - The value to check
 * @returns CSS class name for styling
 */
export function getValueStyle(value: any): string {
  if (value === null) return "text-red-400";

  switch (typeof value) {
    case "string":
      return "text-green-400";
    case "number":
      return "text-blue-400";
    case "boolean":
      return "text-yellow-400";
    default:
      return "text-gray-300";
  }
}

/**
 * Format a value for display in the JSON tree
 * @param value - The value to format
 * @returns Formatted string representation
 */
export function formatValueForDisplay(value: any): string {
  if (value === null) return "null";
  if (typeof value === "string") return `"${value}"`;
  return String(value);
}
