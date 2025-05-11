import {
  ProcessedValue,
  ValueType,
  ConsoleFormatterOptions,
} from "@/components/console/types";

// Marcador para WeakMap global - lo recrearemos para cada invocación
let circularReferences: WeakMap<object, string>;

/**
 * Genera un ID único para valores en la consola
 */
let valueIdCounter = 0;
const getNextValueId = () => `val_${valueIdCounter++}`;

/**
 * Detecta el tipo de un valor JavaScript
 */
export function detectValueType(value: any): ValueType {
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

  // Detección de objetos especiales
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
 * Formatea un valor para mostrar una vista previa
 */
export function formatValuePreview(value: any, type: ValueType): string {
  switch (type) {
    case "string":
      return `"${value.length > 100 ? value.substring(0, 97) + "..." : value}"`;
    case "number":
      return Number.isInteger(value)
        ? value.toString()
        : value.toFixed(10).replace(/\.?0+$/, "");
    case "boolean":
      return value.toString();
    case "null":
      return "null";
    case "undefined":
      return "undefined";
    case "symbol":
      return value.toString();
    case "bigint":
      return `${value.toString()}n`;
    case "function":
      const funcStr = value.toString();
      const firstLine = funcStr.split("\n")[0];
      return firstLine.length > 60
        ? `${firstLine.substring(0, 57)}...`
        : firstLine;
    case "date":
      return value.toISOString();
    case "regexp":
      return value.toString();
    case "error":
      return `${value.name}: ${value.message}`;
    case "promise":
      return "[Promise]";
    case "array":
      return `Array(${value.length})`;
    case "map":
      return `Map(${value.size})`;
    case "set":
      return `Set(${value.size})`;
    case "object":
      const constructor = value.constructor?.name;
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
 * Verifica si un valor tiene hijos (propiedades expandibles)
 */
export function hasChildren(value: any, type: ValueType): boolean {
  switch (type) {
    case "array":
      return Array.isArray(value) && value.length > 0;
    case "object":
      return (
        value !== null &&
        typeof value === "object" &&
        Object.keys(value).length > 0
      );
    case "map":
      return value instanceof Map && value.size > 0;
    case "set":
      return value instanceof Set && value.size > 0;
    case "error":
      return (
        value instanceof Error &&
        (Object.keys(value).length > 0 || value.stack !== undefined)
      );
    default:
      return false;
  }
}

/**
 * Cuenta el número de hijos de un valor
 */
export function countChildren(value: any, type: ValueType): number {
  switch (type) {
    case "array":
      return Array.isArray(value) ? value.length : 0;
    case "object":
      return value !== null && typeof value === "object"
        ? Object.keys(value).length
        : 0;
    case "map":
      return value instanceof Map ? value.size : 0;
    case "set":
      return value instanceof Set ? value.size : 0;
    case "error":
      return value instanceof Error
        ? Object.keys(value).length + (value.stack ? 1 : 0)
        : 0;
    default:
      return 0;
  }
}

/**
 * Procesa objetos anidados para la visualización en consola
 */
export function processValue(
  value: any,
  path: string = "root",
  depth: number = 0,
  key?: string | number,
  options: ConsoleFormatterOptions = {}
): ProcessedValue {
  // Opciones con valores por defecto
  const {
    maxDepth = 10,
    initialExpandLevel = 1,
    detectCircular = true,
  } = options;

  // Para detectar referencias circulares
  if (detectCircular && typeof value === "object" && value !== null) {
    if (circularReferences.has(value)) {
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
    circularReferences.set(value, path);
  }

  // Detectar tipo del valor
  const type = detectValueType(value);

  // Calcular vista previa
  const preview = formatValuePreview(value, type);

  // Determinar si tiene hijos expandibles
  const valueHasChildren = hasChildren(value, type);

  // Determinar si debe estar expandido inicialmente
  const isExpanded = depth < initialExpandLevel && valueHasChildren;

  // Construir objeto de valor procesado
  const processedValue: ProcessedValue = {
    type,
    value: valueHasChildren && depth >= maxDepth ? undefined : value,
    preview,
    hasChildren: valueHasChildren,
    depth,
    path,
    key,
    id: getNextValueId(),
    isExpanded,
  };

  // Contar hijos si es necesario
  if (valueHasChildren) {
    processedValue.childrenCount = countChildren(value, type);
  }

  return processedValue;
}

/**
 * Procesa un valor complejo para obtener sus hijos
 */
export function processChildren(
  parentValue: any,
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
      // Para arrays, limitar el número de elementos si es muy grande
      if (!Array.isArray(parentValue)) return children;

      const maxArrayDisplay = options.maxArrayChildrenDisplay || 100;
      const arrayLength = parentValue.length;
      const displayItems = Math.min(arrayLength, maxArrayDisplay);

      for (let i = 0; i < displayItems; i++) {
        const childPath = `${parentPath}[${i}]`;
        const child = processValue(
          parentValue[i],
          childPath,
          depth + 1,
          i,
          options
        );
        children.push(child);
      }

      // Si hay más elementos, mostrar un indicador
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
      // Para objetos, obtener las propiedades
      if (parentValue === null || typeof parentValue !== "object")
        return children;

      const maxObjectProps = options.maxObjectPropertiesDisplay || 100;
      const keys = Object.keys(parentValue);
      const displayProps = Math.min(keys.length, maxObjectProps);

      for (let i = 0; i < displayProps; i++) {
        const key = keys[i];
        const childPath = `${parentPath}.${key}`;
        const child = processValue(
          parentValue[key],
          childPath,
          depth + 1,
          key,
          options
        );
        children.push(child);
      }

      // Si hay más propiedades, mostrar un indicador
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
      // Para Maps, convertir a entradas
      if (!(parentValue instanceof Map)) return children;

      const mapEntries = Array.from(parentValue.entries());
      const maxMapEntries = options.maxObjectPropertiesDisplay || 100;
      const displayEntries = Math.min(mapEntries.length, maxMapEntries);

      for (let i = 0; i < displayEntries; i++) {
        const [key, val] = mapEntries[i];
        // Procesar la clave
        const keyPath = `${parentPath}.key[${i}]`;
        const keyValue = processValue(
          key,
          keyPath,
          depth + 1,
          `key ${i}`,
          options
        );

        // Procesar el valor
        const valPath = `${parentPath}.val[${i}]`;
        const valValue = processValue(
          val,
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
      // Para Sets, convertir a array
      if (!(parentValue instanceof Set)) return children;

      const setValues = Array.from(parentValue.values());
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
      // Para errores, mostrar propiedades y stack
      if (!(parentValue instanceof Error)) return children;

      const errorKeys = Object.keys(parentValue);

      // Añadir el stack trace primero
      if (parentValue.stack) {
        children.push({
          type: "string",
          value: parentValue.stack,
          preview: "stack",
          depth: depth + 1,
          path: `${parentPath}.stack`,
          key: "stack",
          id: getNextValueId(),
        });
      }

      // Añadir otras propiedades
      for (const key of errorKeys) {
        if (key !== "stack") {
          // El stack ya lo hemos añadido
          const childPath = `${parentPath}.${key}`;
          const child = processValue(
            parentValue[key as keyof Error],
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
 * Procesa múltiples valores para console.log
 */
export function processConsoleValues(
  values: any[],
  options: ConsoleFormatterOptions = {}
): ProcessedValue[] {
  // En vez de intentar limpiar, crear un nuevo WeakMap para cada invocación
  circularReferences = new WeakMap<object, string>();
  valueIdCounter = 0;

  return values.map((value, index) => {
    return processValue(value, `root[${index}]`, 0, index, options);
  });
}
