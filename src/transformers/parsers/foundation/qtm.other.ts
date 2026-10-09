import type { ParserEnum } from "../../../utils/Types/index.ts";

const selectParsingFormat = (target: any, parser: ParserEnum) => {
  return {
    $type: "qtm.other",
    $value: target.$value,
  };
};

export const parseQtmOther = (target: any, parser: ParserEnum) => {
  if (["penpot", "figma", "tokensStudio"].includes(parser))
    return undefined;

  return (target[`${parser}`] = {
    ...selectParsingFormat(target, parser),
  });
};
