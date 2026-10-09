import type { ParserEnum } from "../../../utils/Types/index.ts";

const selectParsingFormat = (target: any, parser: ParserEnum) => {
  switch (parser) {
    case "figma":
    case "penpot":
    case "tokensStudio":
      return {};
    default:
      throw `[animation.ts]: Unimplemented parser: ${parser}`;
  }
};

export const parseAnimation = (target: any, parser: ParserEnum) => {
  return (target[`${parser}`] = {
    ...selectParsingFormat(target, parser),
  });
};
