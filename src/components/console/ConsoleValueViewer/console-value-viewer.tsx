"use client";

import { useState } from "react";
import type { ProcessedValue, ValueType } from "../types";
import { cn } from "@/lib/utils";

/**
 * Prints a value as a literal, expanded by default.
 *
 * Everything used to arrive collapsed behind a chevron: seeing an array of
 * three numbers cost a click. Here the value shows in full; collapsing is the
 * rare action, and it lives on the opening bracket.
 *
 * If the representation fits on one line, it stays on one line. Otherwise it
 * opens as an indented block, the way a formatter would print it.
 */

/** Width past which the value breaks across several lines */
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

/** Delimiters and prefix per type: Map(2) { … }, Set(3) [ … ] */
function brackets(node: ProcessedValue): [string, string, string] {
  switch (node.type) {
    case "array":
      return ["", "[", "]"];
    case "set":
      return [`Set(${node.childrenCount ?? 0}) `, "[", "]"];
    case "map":
      return [`Map(${node.childrenCount ?? 0}) `, "{", "}"];
    default: {
      // `Foo {}` comes from the preview when the object has its own constructor.
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

/** Length the value would take on a single line */
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

  // An Error prints by its message, not as an object: its stack and its
  // properties already show when the entry is selected.
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
    // A container with no serialized children prints as a literal: `[]` when
    // empty, `[…]` when the depth cap cut it. It used to fall through to the
    // preview and print `Array(0)`, which cannot be pasted back into code.
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
