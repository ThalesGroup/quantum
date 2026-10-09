import type { ParserEnum } from "../../../utils/Types/index.ts";

export const durationParserFigma = (target: any) => {
  return {
    $type: "number",
    $value: target.$value.value,
  };
};

const selectParsingFormat = (target: any, parser: ParserEnum) => {
  switch (parser) {
    case "figma":
    case "penpot":
    case "tokensStudio":
      return undefined;
    default:
      throw `[duration.ts]: Unimplemented parser: ${parser}`;
  }
};
export const parseDuration = (target: any, parser: ParserEnum) => {
  return (target[`${parser}`] = {
    ...selectParsingFormat(target, parser),
  });
};
