const baseStructure = {
  Foundation: {},
  Component: {},
  "Mode/Light": {},
  "Mode/Dark": {},
  $themes: [
    {
      name: "Light",
      group: "Mode",
      description: "",
      isSource: false,
      selectedTokenSets: {
        Foundation: "enabled",
        "Mode/Light": "enabled",
        Component: "enabled",
      },
    },
    {
      name: "Dark",
      group: "Mode",
      description: "",
      isSource: false,
      selectedTokenSets: {
        "Mode/Dark": "enabled",
        Foundation: "enabled",
        Component: "enabled",
      },
    },
  ],
  $metadata: {
    tokenSetOrder: ["Foundation", "Component", "Mode/Light", "Mode/Dark"],
    activeThemes: ["Mode/Light"],
    activeSets: ["Foundation", "Mode/Light", "Component"],
  },
} as any;

function extractName(ref: string) {
  if (typeof ref !== "string") return null;
  let file = ref.split("/").pop();
  file = file.replace("-dark.tokens.json", "").replace(".tokens.json", "");
  return file;
}

export const fillPenpotStructure = (tokens: any, tokenFiles: any) => {
  const foundations = tokenFiles.map((source) => {
    if (source.includes("foundation")) return extractName(source);
  });

  for (const tokenName of Object.keys(tokens)) {
    const isFoundationToken = foundations.includes(tokenName.split(".")[0]);
    const isDarkToken =
      tokenName.includes("dark") && !tokenName.includes("color.dark"); // But is not 'color-dark'

    if (isDarkToken) {
      const sanitizedColorName = tokenName.replace("dark.", "");

      createStructure(
        tokens[tokenName],
        sanitizedColorName,
        baseStructure["Mode/Dark"],
      );
    } else {
      if (isFoundationToken) {
        createStructure(tokens[tokenName], tokenName, baseStructure.Foundation);
      } else {
        createStructure(tokens[tokenName], tokenName, baseStructure.Component);
      }
    }
  }

  return baseStructure;
};

export const createStructure = (token: any, tokenName: string, obj: any) => {
  const path = tokenName.split(".");
  let current = obj;
  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    if (i === path.length - 1) {
      current[key] = token;
    } else {
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
  }
};

export const removePenpotDanglingAndFormatAliases = (
  obj: any,
  outputBuffer: any,
) => {
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (!val || typeof val !== "object") continue;

    if (
      "$value" in val &&
      typeof val["$value"] === "string" &&
      val["$value"].startsWith("{") &&
      val["$value"].endsWith("}")
    ) {
      const ref = val["$value"].slice(1, -1);
      let refValue: any = outputBuffer[ref];

      if (refValue == null || !("$value" in refValue)) {
        delete obj[key];
      } else {
        val["$value"] = val["$value"];
      }
    } else {
      removePenpotDanglingAndFormatAliases(val, outputBuffer);
    }
  }
};

export const formatTokensForPenpot = (tokens: any, respTokens: any = {}) => {
  const traversePenpot = (
    obj: any,
    path: string[] = [],
    parentObj: any = respTokens,
  ) => {
    for (const key in obj) {
      const value = obj[key];
      const currentPath = [...path, key];

      if (value?.$value) {
        let name = [...path, key].join(".");

        parentObj[name] = {
          description: "",
          ...value,
        };

        for (const siblingKey in value) {
          traversePenpot(
            value[siblingKey],
            [...currentPath, siblingKey],
            parentObj,
          );
        }
      } else if (typeof value === "object" && value !== null) {
        traversePenpot(value, currentPath, parentObj);
      }
    }
  };

  traversePenpot(tokens);
  return respTokens;
};
