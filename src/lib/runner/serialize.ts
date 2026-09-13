import type { ProcessedValue, ValueType } from "@/components/console/types";
import {
  countChildren,
  detectValueType,
  formatValuePreview,
  hasChildren,
} from "@/lib/utils/console-formatter";

/**
 * Convierte valores vivos en árboles `ProcessedValue` planos que pueden cruzar
 * el límite del worker por structured clone.
 *
 * A diferencia de `console-formatter`, los hijos se calculan de una vez
 * (`children`) en lugar de perezosamente: del otro lado del postMessage ya no
 * existe el objeto original para recorrer.
 */

const MAX_DEPTH = 6;
const MAX_CHILDREN = 100;

/** Valores que structured clone acepta tal cual */
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
      // Funciones, símbolos, objetos: el viewer usa `preview` y `children`.
      return undefined;
  }
}

interface Ctx {
  /** Ancestros en el camino actual, para detectar ciclos reales */
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

  // El contador va incluso en contenedores vacíos: es lo que le permite al
  // viewer distinguir `[]` de un array recortado por profundidad.
  if (isContainer) node.childrenCount = countChildren(value, type);

  if (!expandable) return node;

  if (depth >= MAX_DEPTH) {
    // Más profundo no se serializa. El viewer lo imprime como `[…]`.
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
    // Getters que lanzan, proxies hostiles, toString roto.
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
          // Getter que lanza: se muestra el error en lugar de romper el run.
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
 * Serializa los argumentos de una llamada a console.*
 *
 * @param idPrefix identificador único de la entrada; se usa como raíz de los
 * paths para que expandir un nodo no expanda el mismo path en otra entrada.
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
