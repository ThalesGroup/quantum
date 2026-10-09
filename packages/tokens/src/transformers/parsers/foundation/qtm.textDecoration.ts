import type { ParserEnum } from "../../../utils/Types/index.ts";

export const qtmTextDecorationParser = (target: any, parser: ParserEnum) => {
  switch (target["$value"]) {
    case "none":
    case "underline":
      return {
        $type: parser === 'penpot' || parser === 'tokensStudio' ? "textDecoration" : "string",
        $value: target["$value"],
      };
    default:
      console.log("Unsupported qtm.textDecoration value : ", target["$value"]);
      target["$value"] = null;
      break;
  }
};

export const parseQtmTextDecoration = (target: any, parser: ParserEnum) => {
  return (target[`${parser}`] = {
    ...selectParsingFormat(target, parser),
  });
};

const selectParsingFormat = (target: any, parser: ParserEnum) => {
  switch (parser) {
    case "figma":
      return undefined;
    case "penpot":
    case "tokensStudio":
      return qtmTextDecorationParser(target, parser);
    default:
      throw `[qtm.textDecoration.ts]: Unimplemented parser: ${parser}`;
  }
};
