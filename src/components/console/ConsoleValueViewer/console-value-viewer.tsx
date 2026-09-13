"use client";

import { useState } from "react";
import type { ProcessedValue, ValueType } from "../types";
import { cn } from "@/lib/utils";

/**
 * Imprime un valor como literal, expandido por defecto.
 *
 * Antes todo llegaba colapsado detrás de un chevron: ver un array de tres
 * números costaba un clic. Acá el valor se muestra entero; colapsar es la
 * acción rara, y vive en el corchete de apertura.
 *
 * Si la representación entra en una línea, va en una línea. Si no, se abre en
 * bloque con sangría, como haría un formateador.
 */

/** Ancho a partir del cual el valor se abre en varias líneas */
const MAX_INLINE = 72;

const COLORS: Record<ValueType, string> = {
  string: "text-emerald-600 dark:text-emerald-400",
  number: "text-sky-600 dark:text-sky-400",
  bigint: "text-sky-600 dark:text-sky-400",
  boolean: "text-violet-600 dark:text-violet-400",
  null: "text-zinc-400 dark:text-zinc-500",
  undefined: "text-zinc-400 dark:text-zinc-500",
  function: "text-amber-600 dark:text-amber-400",
  object: "text-zinc-900 dark:text-zinc-100",
  array: "text-zinc-900 dark:text-zinc-100",
  date: "text-pink-600 dark:text-pink-400",
  regexp: "text-orange-600 dark:text-orange-400",
  error: "text-red-600 dark:text-red-400",
  promise: "text-sky-600 dark:text-sky-400",
  symbol: "text-orange-600 dark:text-orange-400",
  map: "text-zinc-900 dark:text-zinc-100",
  set: "text-zinc-900 dark:text-zinc-100",
  circular: "text-zinc-400 dark:text-zinc-500",
};

const punctuation = "text-zinc-400 dark:text-zinc-600";

/** Delimitadores y prefijo por tipo: Map(2) { … }, Set(3) [ … ] */
function brackets(node: ProcessedValue): [string, string, string] {
  switch (node.type) {
    case "array":
      return ["", "[", "]"];
    case "set":
      return [`Set(${node.childrenCount ?? 0}) `, "[", "]"];
    case "map":
      return [`Map(${node.childrenCount ?? 0}) `, "{", "}"];
    default: {
      // `Foo {}` viene del preview cuando el objeto tiene constructor propio.
      const named = node.preview?.endsWith(" {}")
        ? node.preview.slice(0, -2)
        : "";
      return [named, "{", "}"];
    }
  }
}

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function formatKey(node: ProcessedValue, parentType: ValueType): string | null {
  if (node.key === undefined) return null;
  if (parentType === "array" || parentType === "set") return null;
  if (parentType === "map") return `${node.key} => `;
  const key = String(node.key);
  return IDENTIFIER.test(key) ? `${key}: ` : `'${key}': `;
}

/** Largo que ocuparía el valor en una sola línea */
function measure(node: ProcessedValue): number {
  if (!node.hasChildren || !node.children) return node.preview?.length ?? 4;

  const [prefix, open, close] = brackets(node);
  let total = prefix.length + open.length + close.length + 2;

  node.children.forEach((child, index) => {
    if (index > 0) total += 2;
    total += (formatKey(child, node.type)?.length ?? 0) + measure(child);
  });

  return total;
}

interface ValueNodeProps {
  node: ProcessedValue;
  parentType?: ValueType;
}

function ValueNode({ node, parentType }: ValueNodeProps) {
  const [collapsed, setCollapsed] = useState(false);

  const keyLabel = parentType ? formatKey(node, parentType) : null;
  const key = keyLabel && (
    <span className="text-zinc-500 dark:text-zinc-400">{keyLabel}</span>
  );

  // Un Error se imprime por su mensaje, no como objeto: su stack y sus
  // propiedades ya se muestran al seleccionar la entrada.
  if (node.type === "error") {
    return (
      <>
        {key}
        <span className={COLORS.error}>{node.preview}</span>
      </>
    );
  }

  const isContainer =
    node.type === "array" ||
    node.type === "object" ||
    node.type === "map" ||
    node.type === "set";

  if (!node.hasChildren || !node.children || node.children.length === 0) {
    // Un contenedor sin hijos serializados se imprime como literal: `[]` si
    // está vacío, `[…]` si lo cortó el tope de profundidad. Antes caía en el
    // preview y salía un `Array(0)` que no se puede pegar en el código.
    if (isContainer) {
      const [prefix, open, close] = brackets(node);
      const empty = !node.childrenCount;
      return (
        <>
          {key}
          <span className={punctuation}>
            {prefix}
            {open}
            {empty ? "" : " … "}
            {close}
          </span>
        </>
      );
    }

    return (
      <>
        {key}
        <span className={COLORS[node.type]}>{node.preview}</span>
      </>
    );
  }

  const [prefix, open, close] = brackets(node);

  const toggle = (
    <span
      role="button"
      tabIndex={0}
      onClick={(event) => {
        event.stopPropagation();
        setCollapsed((value) => !value);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setCollapsed((value) => !value);
        }
      }}
      className={cn(punctuation, "cursor-pointer hover:text-orange-500")}
      title={collapsed ? "Expand" : "Collapse"}
    >
      {prefix}
      {open}
    </span>
  );

  if (collapsed) {
    return (
      <>
        {key}
        {toggle}
        <span className={punctuation}>…{close}</span>
        <span className="ml-1 text-[11px] text-zinc-400 dark:text-zinc-600">
          {node.childrenCount}
        </span>
      </>
    );
  }

  const children = node.children;

  if (measure(node) <= MAX_INLINE) {
    return (
      <>
        {key}
        {toggle}
        <span className={punctuation}> </span>
        {children.map((child, index) => (
          <span key={child.id}>
            <ValueNode node={child} parentType={node.type} />
            {index < children.length - 1 && (
              <span className={punctuation}>, </span>
            )}
          </span>
        ))}
        <span className={punctuation}> {close}</span>
      </>
    );
  }

  return (
    <>
      {key}
      {toggle}
      <div className="pl-4">
        {children.map((child, index) => (
          <div key={child.id}>
            <ValueNode node={child} parentType={node.type} />
            {index < children.length - 1 && (
              <span className={punctuation}>,</span>
            )}
          </div>
        ))}
      </div>
      <span className={punctuation}>{close}</span>
    </>
  );
}

export function ConsoleValueViewer({ value }: { value: ProcessedValue }) {
  return (
    <span className="whitespace-pre-wrap break-words">
      <ValueNode node={value} />
    </span>
  );
}
