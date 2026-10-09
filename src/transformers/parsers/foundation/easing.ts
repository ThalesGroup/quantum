import type { ParserEnum } from "../../../utils/Types/index.ts";

export const easingParserFigma = (target: any) => {
  let value;

  if (Array.isArray(target.$value.value)) {
    value = `cubic-bezier(${target.$value.value[0]}, ${target.$value.value[1]}, ${target.$value.value[2]}, ${target.$value.value[3]})`;
  } else {
    value = target.$value.value;
  }

  return {
    $type: "string",
    $value: value,
  };
};
const selectParsingFormat = (target: any, parser: ParserEnum) => {
  switch (parser) {
    case "figma":
      return easingParserFigma(target);
    case "penpot":
    case "tokensStudio":
      return {};
    default:
      throw `[easing.ts]: Unimplemented parser: ${parser}`;
  }
};
export const parseEasing = (target: any, parser: ParserEnum) => {
  return (target[`${parser}`] = {
    ...selectParsingFormat(target, parser),
  });
};
