import type { Monaco, OnMount } from "@monaco-editor/react";

/**
 * Puente con el TS worker que Monaco ya trae cargado.
 *
 * De acá salen las tres cosas que pidió el runner nuevo: el JavaScript
 * transpilado, los errores de sintaxis y —gratis, por usar el worker real—
 * el autocompletado del lenguaje.
 */

/**
 * `monaco-editor` no está instalado como paquete (el loader lo trae por CDN),
 * así que el tipo del modelo se deriva del editor, igual que `MonacoEditor`
 * en `lib/types`.
 */
export type TextModel = NonNullable<
  ReturnType<Parameters<OnMount>[0]["getModel"]>
>;

export interface Problem {
  message: string;
  line: number;
  column: number;
  /** true = error de sintaxis; false = error de tipos */
  syntactic: boolean;
}

export interface CompileResult {
  js: string;
  problems: Problem[];
  /** Errores que impiden ejecutar */
  blocking: Problem[];
}

/** Mínimo que necesitamos del TypeScriptWorker de Monaco */
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
 * Transpila el modelo y recoge sus diagnósticos.
 *
 * En TypeScript los errores de tipo también bloquean la ejecución: código que
 * no typechequea es código roto. En JavaScript sólo bloquea la sintaxis.
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

  // El worker de JavaScript no emite nada (getEmitOutput devuelve una lista
  // vacía) y tampoco hace falta: el código ya es ejecutable tal cual. Sólo
  // TypeScript necesita pasar por el transpilador.
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
 * Configura el lenguaje una sola vez, al montar el editor.
 *
 * Clave: acá NO se registra ningún `addExtraLib` con una `interface Console`
 * propia. Hacerlo pisaba la definición de `lib.dom` y era la causa de que el
 * autocompletado de `console` no ofreciera `table`, `dir`, `time`, etc.
 */
export function configureLanguageDefaults(monaco: Monaco): void {
  // `lib` tiene que ir explícito: sin él TypeScript lo deriva del `target`, y
  // con ES2020 faltaban métodos como Array.prototype.at (ES2022) o findLast
  // (ES2023).
  //
  // `webworker` en lugar de `dom` porque es donde el código realmente corre:
  // trae fetch, setTimeout, structuredClone y console, y no ofrece `document`
  // ni `window`, que autocompletaban para después fallar en ejecución.
  const compilerOptions = {
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    lib: ["esnext", "webworker"],
    module: monaco.languages.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    allowNonTsExtensions: true,
    // getEmitOutput() no devuelve nada con noEmit activado.
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
