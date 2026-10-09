import type { NumberType, ParserEnum } from "../../../utils/Types/index.ts";

const selectParsingFormat = (target: any, parser: ParserEnum) => {
  switch (parser) {
    case "figma":
    case "penpot":
      return {
        ...target.$original,
      };
    case "tokensStudio":
      return {
        $type: "number",
        $value: target.$value,
      };
    default:
      throw `[number.ts]: Unimplemented parser: ${parser}`;
  }
};

export const parseNumber = (target: NumberType, parser: ParserEnum) => {
  return (target[`${parser}`] = {
    ...selectParsingFormat(target, parser),
  });
};
