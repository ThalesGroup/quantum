export const loadTokens = (tokensTree: any) => {
  const resTokens: any[] = [];
  const aliasLookup = new Map<string, any>();

  traverse(tokensTree, resTokens, "loadTokens", [], aliasLookup);

  return resTokens;
};

const traverse = (
  obj: any,
  resTokens: any[] = [],
  parser: any,
  path: string[] = [],
  aliasLookup?: Map<string, any>,
) => {
  for (const key in obj) {
    const value = obj[key];
    const currentPath = [...path, key];

    if (value?.$value) {
      if (aliasLookup) {
        aliasLookup.set(currentPath.join("."), value);
      }
      resTokens.push(parseToken(value, currentPath, aliasLookup));
      // Continue into non-$ siblings so that tokens nested under a token node
      // (e.g. "overline-bold.text.case") are also collected.
      for (const siblingKey in value) {
        if (
          !siblingKey.startsWith("$") &&
          typeof value[siblingKey] === "object" &&
          value[siblingKey] !== null
        ) {
          traverse(
            value[siblingKey],
            resTokens,
            parser,
            [...currentPath, siblingKey],
            aliasLookup,
          );
        }
      }
    } else if (typeof value === "object" && value !== null) {
      traverse(value, resTokens, parser, currentPath, aliasLookup);
    }
  }
};

const loadAlias = (alias: string, aliasLookup?: Map<string, any>) => {
  if (!aliasLookup) return { $name: alias };

  const target = aliasLookup.get(alias);

  return {
    $name: alias,
    ...(target ?? {}),
  };
};

const parseToken = (
  target: any,
  path: string[],
  aliasLookup?: Map<string, any>,
) => {
  const alias =
    typeof target.$value === "string" && target.$value.startsWith("{");

  return {
    ...target,
    $name: `${path.join(".")}`,
    isAlias: alias,
    $original: target,
    alias: {
      ...(alias ? loadAlias(target.$value.slice(1, -1), aliasLookup) : {}),
    },
  };
};

