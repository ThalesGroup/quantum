import type { ParserEnum } from "../../../utils/Types/index.ts";

const selectParsingFormat = (target: any, parser: ParserEnum) => {
  switch (parser) {
    // Figma, Penpot, and Tokens Studio do not support stroke style tokens in their UI 
    case "figma":
    case "penpot":
    case "tokensStudio":
      return {};
    default:
      throw `[strokeStyle.ts]: Unimplemented parser: ${parser}`;
  }
};

export const parseStrokeStyle = (target: any, parser: ParserEnum) => {
  return (target[`${parser}`] = {
    ...selectParsingFormat(target, parser),
  });
};
