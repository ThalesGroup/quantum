import type {
  FontFamilyTokenType,
  ParserEnum,
} from "../../../utils/Types/index.ts";

const selectParsingFormat = (target: any, parser: ParserEnum) => {
  switch (parser) {
    case "figma":
    case "penpot":
      return {
        ...target.$original,
      };
    case "tokensStudio":
      return {
        $type: "fontFamilies",
        $value: target.$value,
      };
    default:
      throw `[fontFamiliy.ts]: Unimplemented parser: ${parser}`;
  }
};

export const parseFontFamily = (
  target: FontFamilyTokenType,
  parser: ParserEnum,
) => {
  return (target[`${parser}`] = {
    ...selectParsingFormat(target, parser),
  });
};
