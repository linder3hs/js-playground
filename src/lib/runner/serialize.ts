import type { ProcessedValue, ValueType } from "@/components/console/types";
import {
  countChildren,
  detectValueType,
  formatValuePreview,
  hasChildren,
} from "@/lib/utils/console-formatter";

/**
 * Turns live values into flat `ProcessedValue` trees that can cross the worker
 * boundary through structured clone.
 *
 * Unlike `console-formatter`, children are computed up front (`children`)
 * instead of lazily: on the other side of postMessage the original object no
 * longer exists to walk.
 */

const MAX_DEPTH = 6;
const MAX_CHILDREN = 100;

/** Values structured clone accepts as they are */
type CloneSafe = string | number | boolean | bigint | null | undefined;

function cloneSafeValue(value: unknown, type: ValueType): CloneSafe {
  switch (type) {
    case "string":
    case "number":
    case "boolean":
    case "bigint":
      return value as CloneSafe;
    case "null":
      return null;
    default:
      // Functions, symbols, objects: the viewer uses `preview` and `children`.
      return undefined;
  }
}

interface Ctx {
  /** Ancestors on the current path, to detect real cycles */
  ancestors: Set<object>;
  nextId: () => string;
}

function serializeValue(
  value: unknown,
  path: string,
  depth: number,
  key: string | number | undefined,
  ctx: Ctx
): ProcessedValue {
  const isObjectLike = typeof value === "object" && value !== null;

  if (isObjectLike && ctx.ancestors.has(value as object)) {
    return {
      type: "circular",
      value: "[Circular Reference]",
      preview: "[Circular Reference]",
      hasChildren: false,
      depth,
      path,
      key,
      id: ctx.nextId(),
    };
  }

  const type = detectValueType(value);
  const expandable = hasChildren(value, type);
  const isContainer =
    type === "array" || type === "object" || type === "map" || type === "set";

  const node: ProcessedValue = {
    type,
    value: cloneSafeValue(value, type),
    preview: safePreview(value, type),
    hasChildren: expandable,
    depth,
    path,
    key,
    id: ctx.nextId(),
  };

  // The count is kept even for empty containers: that is what lets the viewer
  // tell `[]` apart from an array cut off by the depth cap.
  if (isContainer) node.childrenCount = countChildren(value, type);

  if (!expandable) return node;

  if (depth >= MAX_DEPTH) {
    // Deeper than this is not serialized. The viewer prints it as `[…]`.
    node.hasChildren = false;
    return node;
  }

  ctx.ancestors.add(value as object);
  node.children = serializeChildren(value, type, path, depth, ctx);
  ctx.ancestors.delete(value as object);

  return node;
}

function safePreview(value: unknown, type: ValueType): string {
  try {
    return formatValuePreview(value, type);
  } catch {
    // Getters that throw, hostile proxies, a broken toString.
    return `[${type}]`;
  }
}

function truncationNode(
  hidden: number,
  noun: string,
  path: string,
  depth: number,
  ctx: Ctx
): ProcessedValue {
  return {
    type: "string",
    value: `… ${hidden} more ${noun}`,
    preview: `… ${hidden} more ${noun}`,
    hasChildren: false,
    depth: depth + 1,
    path: `${path}.more`,
    id: ctx.nextId(),
  };
}

function serializeChildren(
  parent: unknown,
  parentType: ValueType,
  parentPath: string,
  depth: number,
  ctx: Ctx
): ProcessedValue[] {
  const children: ProcessedValue[] = [];

  switch (parentType) {
    case "array": {
      const arr = parent as unknown[];
      const shown = Math.min(arr.length, MAX_CHILDREN);
      for (let i = 0; i < shown; i++) {
        children.push(
          serializeValue(arr[i], `${parentPath}[${i}]`, depth + 1, i, ctx)
        );
      }
      if (arr.length > shown) {
        children.push(
          truncationNode(arr.length - shown, "items", parentPath, depth, ctx)
        );
      }
      break;
    }

    case "set": {
      const values = Array.from(parent as Set<unknown>);
      const shown = Math.min(values.length, MAX_CHILDREN);
      for (let i = 0; i < shown; i++) {
        children.push(
          serializeValue(values[i], `${parentPath}[${i}]`, depth + 1, i, ctx)
        );
      }
      if (values.length > shown) {
        children.push(
          truncationNode(values.length - shown, "items", parentPath, depth, ctx)
        );
      }
      break;
    }

    case "map": {
      const entries = Array.from((parent as Map<unknown, unknown>).entries());
      const shown = Math.min(entries.length, MAX_CHILDREN);
      for (let i = 0; i < shown; i++) {
        const [mapKey, mapValue] = entries[i];
        const keyLabel = safePreview(mapKey, detectValueType(mapKey));
        children.push(
          serializeValue(
            mapValue,
            `${parentPath}[${i}]`,
            depth + 1,
            keyLabel,
            ctx
          )
        );
      }
      if (entries.length > shown) {
        children.push(
          truncationNode(
            entries.length - shown,
            "entries",
            parentPath,
            depth,
            ctx
          )
        );
      }
      break;
    }

    case "error": {
      const err = parent as Error;
      if (err.stack) {
        children.push({
          type: "string",
          value: err.stack,
          preview: err.stack,
          hasChildren: false,
          depth: depth + 1,
          path: `${parentPath}.stack`,
          key: "stack",
          id: ctx.nextId(),
        });
      }
      for (const key of Object.keys(err)) {
        if (key === "stack") continue;
        children.push(
          serializeValue(
            (err as unknown as Record<string, unknown>)[key],
            `${parentPath}.${key}`,
            depth + 1,
            key,
            ctx
          )
        );
      }
      break;
    }

    case "object": {
      const obj = parent as Record<string, unknown>;
      const keys = Object.keys(obj);
      const shown = Math.min(keys.length, MAX_CHILDREN);
      for (let i = 0; i < shown; i++) {
        const key = keys[i];
        let childValue: unknown;
        try {
          childValue = obj[key];
        } catch (error) {
          // A throwing getter: the error is shown instead of breaking the run.
          childValue = error;
        }
        children.push(
          serializeValue(
            childValue,
            `${parentPath}.${key}`,
            depth + 1,
            key,
            ctx
          )
        );
      }
      if (keys.length > shown) {
        children.push(
          truncationNode(
            keys.length - shown,
            "properties",
            parentPath,
            depth,
            ctx
          )
        );
      }
      break;
    }
  }

  return children;
}

/**
 * Serializes the arguments of a console.* call.
 *
 * @param idPrefix unique identifier for the entry; used as the root of the
 * paths so expanding a node does not expand the same path in another entry.
 */
export function serializeArgs(
  args: unknown[],
  idPrefix: string
): ProcessedValue[] {
  let counter = 0;
  const ctx: Ctx = {
    ancestors: new Set<object>(),
    nextId: () => `${idPrefix}_v${counter++}`,
  };

  return args.map((arg, index) =>
    serializeValue(arg, `${idPrefix}[${index}]`, 0, index, ctx)
  );
}
