import type {
  DimensionTokenType,
  ParserEnum,
} from "../../../utils/Types/index.ts";

export type tokensStudioDimensionType = {
  value: string;
  type: "dimension";
};

type ParserConfig = {
  type: string;
  valueTransformer: (target: DimensionTokenType | tokensStudioDimensionType, baseUnit: number) => any;
  baseUnit?: number;
  overrideTypeCallback?: (target: any, defaultType: string) => string;
};

function createDimensionParser({ type, valueTransformer, baseUnit = 16, overrideTypeCallback }: ParserConfig) {
  return (target: DimensionTokenType | tokensStudioDimensionType) => {
    return {
      $type: overrideTypeCallback ? overrideTypeCallback(target, type) : type,
      $value: valueTransformer(target, baseUnit),
    };
  };
}

export const dimensionParserFigma = createDimensionParser({
  type: "number",
  valueTransformer: (target, baseUnit) => {
    if (typeof target.$value === "string") return target.$value;
    const { unit, value: v } = target.$value;
    return unit === "rem" ? v * baseUnit : v;
  }
});

export const dimensionParserPenpot = createDimensionParser({
  type: "dimension",
  valueTransformer: (target, baseUnit) => {
    if (typeof target.$value === "string") return target.$value;
    const { unit, value: v } = target.$value;
    // TODO: shouldn't be tackled here
    if (target.$name.includes('font.scale') && target.$name.includes('line.height')) {
      return unit === "rem" ? v : v * baseUnit;
    }
    return unit === "rem" ? v * baseUnit + "px" : v + unit;
  },
  overrideTypeCallback: (target, defaultType) =>
    target.$extensions?.qtm?.penpot?.type || defaultType
});

export const dimensionParserTokensStudio = createDimensionParser({
  type: "dimension",
  valueTransformer: (target) => {
    if (typeof target.$value === "string") return target.$value;
    const { unit, value: v } = target.$value;
    return v + unit;
  },
  overrideTypeCallback: (target, defaultType) =>
    target.$extensions?.qtm?.tokensStudio?.type || defaultType
});

const selectParsingFormat = (
  target: DimensionTokenType,
  parser: ParserEnum,
) => {
  switch (parser) {
    case "figma":
      return dimensionParserFigma({ ...target });
    case "penpot":
      return dimensionParserPenpot({ ...target });
    case "tokensStudio":
      return dimensionParserTokensStudio({ ...target });
    default:
      throw `[dimension.ts]: Unimplemented parser: ${parser}`;
  }
};

export const parseDimension = (
  target: DimensionTokenType,
  parser: ParserEnum,
) => {
  return (target[`${parser}`] = {
    ...selectParsingFormat(target, parser),
  });
};
