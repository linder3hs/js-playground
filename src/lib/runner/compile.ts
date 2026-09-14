import type { Monaco, OnMount } from "@monaco-editor/react";

/**
 * Bridge to the TS worker Monaco already has loaded.
 *
 * It provides the three things the new runner needed: the transpiled
 * JavaScript, the syntax errors and — for free, by using the real worker —
 * language autocomplete.
 */

/**
 * `monaco-editor` is not installed as a package (the loader pulls it from a
 * CDN), so the model type is derived from the editor, the same way
 * `MonacoEditor` is in `lib/types`.
 */
export type TextModel = NonNullable<
  ReturnType<Parameters<OnMount>[0]["getModel"]>
>;

export interface Problem {
  message: string;
  line: number;
  column: number;
  /** true = syntax error; false = type error */
  syntactic: boolean;
}

export interface CompileResult {
  js: string;
  problems: Problem[];
  /** Errors that block execution */
  blocking: Problem[];
}

/** The minimum we need from Monaco's TypeScriptWorker */
interface TsWorker {
  getSyntacticDiagnostics(fileName: string): Promise<TsDiagnostic[]>;
  getSemanticDiagnostics(fileName: string): Promise<TsDiagnostic[]>;
  getEmitOutput(fileName: string): Promise<{
    outputFiles: { name: string; text: string }[];
  }>;
}

interface TsDiagnostic {
  start?: number;
  length?: number;
  messageText: string | { messageText: string; next?: unknown[] };
}

function flattenMessage(messageText: TsDiagnostic["messageText"]): string {
  return typeof messageText === "string"
    ? messageText
    : messageText.messageText;
}

function toProblem(
  diagnostic: TsDiagnostic,
  model: TextModel,
  syntactic: boolean
): Problem {
  const position =
    diagnostic.start !== undefined
      ? model.getPositionAt(diagnostic.start)
      : { lineNumber: 1, column: 1 };

  return {
    message: flattenMessage(diagnostic.messageText),
    line: position.lineNumber,
    column: position.column,
    syntactic,
  };
}

/**
 * Transpiles the model and collects its diagnostics.
 *
 * In TypeScript, type errors block execution too: code that does not
 * typecheck is broken code. In JavaScript only syntax blocks.
 */
export async function compileModel(
  monaco: Monaco,
  model: TextModel
): Promise<CompileResult> {
  const isTypeScript = model.getLanguageId() === "typescript";

  const getWorker = isTypeScript
    ? await monaco.languages.typescript.getTypeScriptWorker()
    : await monaco.languages.typescript.getJavaScriptWorker();

  const client = (await getWorker(model.uri)) as unknown as TsWorker;
  const fileName = model.uri.toString();

  const [syntactic, semantic] = await Promise.all([
    client.getSyntacticDiagnostics(fileName),
    client.getSemanticDiagnostics(fileName),
  ]);

  const problems = [
    ...syntactic.map((d) => toProblem(d, model, true)),
    ...semantic.map((d) => toProblem(d, model, false)),
  ];

  const blocking = problems.filter((p) => p.syntactic || isTypeScript);

  // The JavaScript worker emits nothing (getEmitOutput returns an empty
  // list), and it does not need to: the code already runs as written. Only
  // TypeScript has to go through the transpiler.
  let js = "";
  if (syntactic.length === 0) {
    if (isTypeScript) {
      const output = await client.getEmitOutput(fileName);
      js = output.outputFiles.find((f) => f.name.endsWith(".js"))?.text ?? "";
    } else {
      js = model.getValue();
    }
  }

  return { js, problems, blocking };
}

/**
 * Configures the language once, when the editor mounts.
 *
 * Key detail: no `addExtraLib` with a homegrown `interface Console` is
 * registered here. Doing that shadowed the `lib.dom` definition and was why
 * `console` autocomplete never offered `table`, `dir`, `time`, and so on.
 */
export function configureLanguageDefaults(monaco: Monaco): void {
  // `lib` has to be explicit: without it TypeScript derives it from `target`,
  // and with ES2020 methods like Array.prototype.at (ES2022) or findLast
  // (ES2023) were missing.
  //
  // `webworker` instead of `dom` because that is where the code actually runs:
  // it brings fetch, setTimeout, structuredClone and console, and it does not
  // offer `document` or `window`, which used to autocomplete and then fail at
  // runtime.
  const compilerOptions = {
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    lib: ["esnext", "webworker"],
    module: monaco.languages.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    allowNonTsExtensions: true,
    // getEmitOutput() returns nothing while noEmit is on.
    noEmit: false,
  };

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    ...compilerOptions,
    strict: true,
  });
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
    compilerOptions
  );

  for (const defaults of [
    monaco.languages.typescript.typescriptDefaults,
    monaco.languages.typescript.javascriptDefaults,
  ]) {
    defaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
  }
}
