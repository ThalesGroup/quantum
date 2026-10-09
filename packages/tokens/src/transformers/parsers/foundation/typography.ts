import type { ParserEnum } from "../../../utils/Types/index.ts";

export const typographyParser = (target: any, parser: ParserEnum) => {
  const targetValue = structuredClone(target);
  let obj = {} as any;

  const isAlias = typeof targetValue.$value === "string";
  if (isAlias) {
    obj = targetValue.$value;
  } else {
    if (targetValue.$value.fontFamily) {
      obj.fontFamily = targetValue.$value.fontFamily;
    }

    if (targetValue.$value.fontSize) {
      obj.fontSize = targetValue.$value.fontSize;
    }
    if (targetValue.$value.fontWeight) {
      obj.fontWeight = targetValue.$value.fontWeight;
    }
    if (targetValue.$value.lineHeight) {
      obj.lineHeight = targetValue.$value.lineHeight;
    }
    if (targetValue.$value.letterSpacing) {
      obj.letterSpacing = quickFormatLetterSpacing(
        targetValue.$value.letterSpacing,
        16,
        parser,
      );
    }
  }

  return {
    $type: targetValue.$type,
    $value: obj,
  };
};

const quickFormatLetterSpacing = (
  letterSpacing: { value: number; unit: "px" | "rem" },
  baseUnit: number,
  parser: ParserEnum,
) => {
  const { value, unit } = letterSpacing;
  let letterSpacingValue = value;
  if (unit === "rem") {
    letterSpacingValue = value * baseUnit;
  }

  switch (parser) {
    case "figma":
      return {
        $type: "number",
        $value: letterSpacingValue,
      };

    case "penpot":
    case "tokensStudio":
      return `${letterSpacingValue}px`;    

    default:
      break;
  }
};

const selectParsingFormat = (target: any, parser: ParserEnum) => {
  switch (parser) {
    case "penpot":
    case "tokensStudio":
      return typographyParser(target, parser);

    case "figma":
      const a = {
        fontFamily: { $value: target.$value.fontFamily },
        fontSize: { $value: target.$value.fontSize },
        fontWeight: { $value: target.$value.fontWeight },
        letterSpacing: quickFormatLetterSpacing(
          target.$value.letterSpacing,
          16,
          parser,
        ),
        lineHeight: { $value: target.$value.lineHeight },
      };

      return a;
    default:
      throw `[typography.ts]: Unimplemented parser: ${parser}`;
  }
};

export const parseTypography = (target: any, parser: ParserEnum) => {
  return (target[`${parser}`] = {
    ...selectParsingFormat(target, parser),
  });
};
