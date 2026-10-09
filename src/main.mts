import { loadTokens } from "./transformers/parsers/parser.ts";
import { parseFoundation } from "./transformers/parsers/foundation/parseFoundation.ts";
import { createFiles } from "./utils/createFiles.ts";
import type { ParserEnum } from "./utils/Types/index.ts";
import { join, dirname, basename } from "path";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import formatters from "./utils/formatters.ts";
// Parsers that use the type-override sub-algorithm
const TYPE_AWARE_PARSERS = new Set<ParserEnum>(["penpot", "tokensStudio"]);

// Returns the parser-specific type override from a raw token object,
// e.g. $extensions.qtm.penpot.type  or  $extensions.qtm.tokensStudio.type
function getExtensionType(
  obj: any,
  parserName: ParserEnum,
): string | undefined {
  return obj?.$extensions?.qtm?.[parserName]?.type;
}

// Follow a {ref} string to its $value if it is itself a reference, one level deep.
function resolveRefChain(pathArr: string[], loadedTokens: any[]): string[] {
  const pathStr = pathArr.join(".");
  const token = loadedTokens.find((t) => t.$name === pathStr);
  if (!token) return pathArr;

  const parserVal = token[parser]?.["$value"];
  const rawVal = token["$value"] ?? parserVal;
  const val = parserVal ?? rawVal;

  if (typeof val === "string" && val.startsWith("{") && val.endsWith("}")) {
    return val.slice(1, -1).split(".");
  }
  return pathArr;
}

function getTypeFromReference(
  pathArr: string[],
  outputBuffer: any,
  loadedTokens: any[],
  parserName: ParserEnum,
): string | undefined {
  function lookupType(parts: string[]): string | undefined {
    let current: any = outputBuffer;
    for (const part of parts) {
      if (!current || typeof current !== "object" || !(part in current)) {
        current = undefined;
        break;
      }
      current = current[part];
    }
    if (current && typeof current === "object") {
      if (getExtensionType(current, parserName))
        return getExtensionType(current, parserName);
      if (current.$type) return current.$type;
    }

    const pathStr = parts.join(".");
    const canonicalToken = loadedTokens.find((t) => t.$name === pathStr);
    if (canonicalToken) {
      const parserData = canonicalToken[parserName];
      if (getExtensionType(parserData, parserName))
        return getExtensionType(parserData, parserName);
      if (parserData?.$type) return parserData.$type;
      if (getExtensionType(canonicalToken, parserName))
        return getExtensionType(canonicalToken, parserName);
      if (canonicalToken.$type) return canonicalToken.$type;
    }

    return undefined;
  }

  const direct = lookupType(pathArr);
  if (direct) return direct;

  const resolved = resolveRefChain(pathArr, loadedTokens);
  if (resolved !== pathArr) return lookupType(resolved);

  return undefined;
}

// Walk raw merged JSON and collect all parser-specific penpot/tokensStudio type overrides
// keyed by dot-path (e.g. "spacing.s" -> "spacing")
function collectTypeOverrides(
  obj: any,
  parserName: ParserEnum,
  path: string[] = [],
  map: Map<string, string> = new Map(),
): Map<string, string> {
  if (!obj || typeof obj !== "object") return map;
  if ("$value" in obj) {
    const override = getExtensionType(obj, parserName);
    if (override) map.set(path.join("."), override);
    return map;
  }
  for (const key of Object.keys(obj)) {
    if (!key.startsWith("$")) {
      collectTypeOverrides(obj[key], parserName, [...path, key], map);
    }
  }
  return map;
}

function findTokenFiles(dir: string, prefix = ""): string[] {
  let files: string[] = [];
  for (const file of readdirSync(dir)) {
    const path = join(dir, file);
    const rel = prefix ? join(prefix, file) : file;
    if (statSync(path).isDirectory()) {
      files = files.concat(findTokenFiles(path, rel));
    } else if (file.endsWith(".tokens.json")) {
      files.push(rel);
    }
  }
  return files;
}

/**
 * Attach dark variant tokens onto the merged base tokens under a `dark` key.
 *
 * For each component base file (e.g. `component/button.tokens.json`), if a
 * matching dark file exists (e.g. `component/button-dark.tokens.json`),
 * this function:
 *
 * - loads the base dark tokens from `dtcg`
 * - optionally merges parser-specific dark overrides from `dtcg-extensions/<parser>`
 * - attaches the resulting dark tokens onto each top-level key in `merged` as `node.dark`
 */
function attachDarkVariants(
  merged: any,
  baseFile: string,
  allTokenFiles: string[],
  extensionsDir?: string,
) {
  const isComponentFile =
    baseFile.startsWith("component/") &&
    !baseFile.includes("-dark.tokens.json");
  if (!isComponentFile) return;

  const darkFile = baseFile.replace(/\.tokens\.json$/, "-dark.tokens.json");
  if (!allTokenFiles.includes(darkFile)) return;

  const baseDarkPath = join("dtcg", darkFile);
  const baseDarkTokens = JSON.parse(readFileSync(baseDarkPath, "utf-8"));

  let mergedDarkTokens = baseDarkTokens;

  if (extensionsDir) {
    const parserDarkPath = join(extensionsDir, darkFile);
    if (existsSync(parserDarkPath)) {
      const parserDarkTokens = JSON.parse(
        readFileSync(parserDarkPath, "utf-8"),
      );
      mergedDarkTokens = deepMergeOverwrite(baseDarkTokens, parserDarkTokens);
    }
  }

  for (const key of Object.keys(merged)) {
    const node = merged[key];
    if (node && typeof node === "object") {
      node.dark = mergedDarkTokens[key] ?? mergedDarkTokens;
    }
  }
}

function deepMergeOverwrite(base: any, override: any): any {
  if (Array.isArray(base)) {
    return Array.isArray(override) ? override : base;
  }
  if (
    typeof base === "object" &&
    typeof override === "object" &&
    base !== null &&
    override !== null
  ) {
    const out: any = {};
    for (const key of Object.keys(base)) {
      if (key in override) {
        out[key] = deepMergeOverwrite(base[key], override[key]);
      } else {
        out[key] = base[key];
      }
    }
    for (const key of Object.keys(override)) {
      if (!(key in base)) {
        out[key] = override[key];
      }
    }
    return out;
  }
  return override !== undefined ? override : base;
}

// --- Entry point ---

const parserIndex = process.argv.indexOf("--parser");
const parser =
  parserIndex > -1 ? (process.argv[parserIndex + 1] as ParserEnum) : undefined;
const extensionsDir = parser ? `dtcg-extensions/${parser}` : undefined;

if (!parser || !extensionsDir || !existsSync(extensionsDir)) {
  console.error(
    "ERROR: script cannot be run without a valid parser and extension directory.",
  );
  process.exit(1);
}

const outputFormat = {
  loadTokens: "json",
  tokensStudio: "json",
  penpot: "json",
  figma: "json",
}[parser] as "json" | "xml";

const isTypeAware = TYPE_AWARE_PARSERS.has(parser);

const tokenFiles = findTokenFiles("dtcg");

let loadedTokens: any[] = [];
const relevantMergedFiles: string[] = [];

// Build type overrides map from raw merged JSON (before loadTokens strips $extensions)
const typeOverrides = new Map<string, string>();

// Process every dtcg token file, merging parser-specific overrides when present
for (const tokenFile of tokenFiles) {
  const baseTokensPath = join("dtcg", tokenFile);
  const baseTokens = JSON.parse(readFileSync(baseTokensPath, "utf-8"));

  const parserTokensPath = join(extensionsDir, tokenFile);
  let mergedTokens = baseTokens;

  if (existsSync(parserTokensPath)) {
    const parserTokens = JSON.parse(readFileSync(parserTokensPath, "utf-8"));
    mergedTokens = deepMergeOverwrite(baseTokens, parserTokens);
  }

  // For components, attach dark variants under `dark` (from *-dark.tokens.json)
  attachDarkVariants(mergedTokens, tokenFile, tokenFiles, extensionsDir);

  if (isTypeAware) {
    collectTypeOverrides(mergedTokens, parser, [], typeOverrides);
  }

  loadedTokens = loadedTokens.concat(loadTokens(mergedTokens));
  relevantMergedFiles.push(tokenFile);
}

// If no merged files, just exit
if (!loadedTokens.length) {
  console.log("No parser overrides found, nothing to output.");
  process.exit(0);
}

for (const token of loadedTokens) {
  parseFoundation(token, parser);
}

let outputBuffer = {} as any;

/**
 * Format to JSON with deepness
 */
if (outputFormat === "json") {
  for (const token of loadedTokens) {
    const path = token.$name.split(".");
    let cursor = outputBuffer;

    for (let i = 0; i < path.length; i++) {
      const p = path[i];
      const isLeaf = i === path.length - 1;

      if (typeof cursor[p] === "undefined") {
        cursor[p] = {};
      }

      if (isLeaf) {
        const baseTokenData = token[parser];
        let outObj =
          typeof baseTokenData === "object" && baseTokenData !== null
            ? { ...baseTokenData }
            : baseTokenData;

        if (
          isTypeAware &&
          outObj &&
          typeof outObj === "object" &&
          "$value" in outObj
        ) {
          const directOverride = typeOverrides.get(token.$name);
          if (directOverride) {
            outObj["$type"] = directOverride;
          } else if (
            typeof outObj["$value"] === "string" &&
            outObj["$value"].startsWith("{") &&
            outObj["$value"].endsWith("}")
          ) {
            const ref = outObj["$value"].slice(1, -1);
            const refOverride = typeOverrides.get(ref);
            if (refOverride) {
              outObj["$type"] = refOverride;
            } else {
              const type = getTypeFromReference(
                ref.split("."),
                outputBuffer,
                loadedTokens,
                parser,
              );
              if (type) {
                outObj["$type"] = type;
              }
            }
          }
        }

        cursor[p] = outObj;
        continue;
      }

      cursor = cursor[p];
    }
  }

  // Format output for penpot
  if ((formatters as any)[parser as any]) {
    outputBuffer = (formatters as any)[parser as any].formatTokensForPenpot(
      outputBuffer,
    );

    (formatters as any)[parser as any].removePenpotDanglingAndFormatAliases(
      outputBuffer,
      outputBuffer,
    );
  } else {
    // Post-write cleanup: remove aliases whose target is absent from outputBuffer
    function removeDanglingAliases(obj: any): void {
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (!val || typeof val !== "object") continue;

        if (
          "$value" in val &&
          typeof val["$value"] === "string" &&
          val["$value"].startsWith("{") &&
          val["$value"].endsWith("}")
        ) {
          const refParts = val["$value"].slice(1, -1).split(".");
          let refCursor: any = outputBuffer;
          for (const part of refParts) {
            refCursor = refCursor?.[part];
          }
          if (refCursor == null || !("$value" in refCursor)) {
            console.log("Dangling alias removed: ", val);
            delete obj[key];
          }
        } else {
          removeDanglingAliases(val);
        }
      }
    }

    removeDanglingAliases(outputBuffer);
  }
}

// Only write merged files to dist
for (const tokenFile of relevantMergedFiles) {
  createFiles({
    parser,
    output: {
      directory: "dist",
      format: outputFormat,
      file: basename(tokenFile),
      singleFile: (formatters as any)[parser as any]
        ? (formatters as any)[parser as any].singleFile
        : false,
      subdirectory: dirname(tokenFile) === "." ? undefined : dirname(tokenFile),
    },
    data: {
      set: (formatters as any)[parser as any]
        ? (formatters as any)[parser as any].fillPenpotStructure(
            outputBuffer,
            tokenFiles,
          )
        : outputBuffer,
      length: loadedTokens.length,
    },
  });
}
