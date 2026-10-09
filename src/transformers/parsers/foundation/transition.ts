import type { ParserEnum } from "../../../utils/Types/index.ts";

const selectParsingFormat = (target: any, parser: ParserEnum) => {
  switch (parser) {
    case "figma":
    case "penpot":
    case "tokensStudio":
      return {};
    default:
      throw `[transition.ts]: Unimplemented parser: ${parser}`;
  }
};

export const parseTransition = (target: any, parser: ParserEnum) => {
  return (target[`${parser}`] = {
    ...selectParsingFormat(target, parser),
  });
};
