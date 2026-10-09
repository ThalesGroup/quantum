import type {
  DimensionTokenType,
  ParserEnum,
} from "../../../utils/Types/index.ts";
import type { tokensStudioDimensionType } from "./dimension.ts";

export const fontWeightParserFigma = (
  target: DimensionTokenType | tokensStudioDimensionType,
) => {
  const isAlias = typeof target.$value === "string";

  if (isAlias) {
    return target.$value;
  }

  return {
    $type: "number",
    $value: target.$value,
  };
};

const selectParsingFormat = (
  target: DimensionTokenType,
  parser: ParserEnum,
) => {
  switch (parser) {
    case "figma":
      return fontWeightParserFigma(target);
    case "penpot":
      return target.$original;
    case "tokensStudio":
      return {
        $type: "fontWeights",
        $value: target.$value,
      };
    default:
      throw `[fontWeight.ts]: Unimplemented parser: ${parser}`;
  }
};
export const parseFontWeight = (
  target: DimensionTokenType,
  parser: ParserEnum,
) => {
  return (target[`${parser}`] = {
    ...selectParsingFormat(target, parser),
  });
};
