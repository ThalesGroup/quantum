import type { ColorTokenType, ParserEnum } from "../../../utils/Types/index.ts";

export type tokensStudioColorType = {
  value: string;
  type: "color";
};

export const componentToRGBA = (color: ColorTokenType) => {
  if (typeof color.$value === "string") throw "cannot convert alias to RGBA";

  let a = 1;
  const r =
    color["$value"].components[0] === "none"
      ? 0
      : color["$value"].components[0];
  const g =
    color["$value"].components[1] === "none"
      ? 0
      : color["$value"].components[1];
  const b =
    color["$value"].components[2] === "none"
      ? 0
      : color["$value"].components[2];
  if (color["$value"].alpha !== undefined && color["$value"].alpha < 1) {
    a = color["$value"].alpha;
  }

  const toRgbChannel = (component: number) => Math.round(component * 255);

  return `rgba(${toRgbChannel(r)}, ${toRgbChannel(g)}, ${toRgbChannel(b)}, ${a})`;
};

export const componentToHSLA = (color: ColorTokenType) => {
  if (typeof color.$value === "string") throw "cannot convert alias to HSLA";
  let a = 1;
  const h =
    color["$value"].components[0] === "none"
      ? 0
      : color["$value"].components[0];
  const s =
    color["$value"].components[1] === "none"
      ? 0
      : color["$value"].components[1];
  const l =
    color["$value"].components[2] === "none"
      ? 0
      : color["$value"].components[2];

  if (color["$value"].alpha !== undefined && color["$value"].alpha < 1) {
    a = color["$value"].alpha;
  }
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
};

export const colorParser = (target: ColorTokenType) => {
  let value;

  if (typeof target.$value === "string") {
    value = target.$value;
  } else if (
    target.$value.colorSpace === "hsla" ||
    target.$value.colorSpace === "hsl"
  ) {
    value = componentToHSLA(target);
  } else {
    value = componentToRGBA(target);
  }

  return {
    $type: "color",
    $value: value,
  };
};

const selectParsingFormat = (target: any, parser: ParserEnum) => {
  switch (parser) {
    case "figma":
      return {
        ...target.$original,
      };
    case "penpot":
    case "tokensStudio":
      return colorParser(target);
    default:
      throw `[color.ts]: Unimplemented parser: ${parser}`;
  }
};

export const parseColor = (
  target: ColorTokenType | tokensStudioColorType,
  parser: ParserEnum,
) => {
  target[`${parser}`] = {
    ...selectParsingFormat(target, parser),
  };
};
