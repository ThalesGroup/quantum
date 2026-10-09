import type { ParserEnum } from "../../../utils/Types/index.ts";
import { colorParser } from "./color.ts";

function hslToRgbNormalized(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const C = (1 - Math.abs(2 * l - 1)) * s;
  const X = C * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - C / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60)      [r, g, b] = [C, X, 0];
  else if (60 <= h && h < 120)  [r, g, b] = [X, C, 0];
  else if (120 <= h && h < 180) [r, g, b] = [0, C, X];
  else if (180 <= h && h < 240) [r, g, b] = [0, X, C];
  else if (240 <= h && h < 300) [r, g, b] = [X, 0, C];
  else if (300 <= h && h < 360) [r, g, b] = [C, 0, X];

  return [r + m, g + m, b + m];
}

export const shadowParserTokensStudio = (target: any) => {
  let targetValue = structuredClone(target.$value);
  const res = [];

  for (const value of targetValue) {
    res.push({
      blur: `${value.blur.value}${value.blur.unit}`,
      color: colorParser({ $type: "color", $value: value.color }).$value,
      spread: `${value.spread.value}${value.spread.unit}`,
      type: "dropShadow",
      x: `${value.offsetX.value}${value.offsetX.unit}`,
      y: `${value.offsetY.value}${value.offsetY.unit}`,
    });
  }

  return {
    $type: "boxShadow",
    $value: res,
  };
};

const shadowParserFigma = (target: any) => {
  const res = {};
  let i = 0;

  for (const value of target.$value) {
    i++;
    let colorOut;

    if (value.color && value.color.colorSpace === "hsl") {
      const [r, g, b] = hslToRgbNormalized(
        value.color.components[0],
        value.color.components[1],
        value.color.components[2]
      );
      colorOut = {
        colorSpace: "srgb",
        components: [Number(r.toFixed(4)), Number(g.toFixed(4)), Number(b.toFixed(4))],
        alpha: value.color.alpha,
      };
    } else {
      // passthrough for pre-normalized or other spaces
      colorOut = value.color;
    }

    res[`shadow_property_${i}`] = {
      offsetX: {
        $type: "number",
        $value: value.offsetX.value,
      },
      offsetY: {
        $type: "number",
        $value: value.offsetY.value,
      },
      blurRadius: {
        $type: "number",
        $value: value.blur.value,
      },
      spreadRadius: {
        $type: "number",
        $value: value.spread.value,
      },
      color: {
        $type: "color",
        $value: colorOut,
      },
    };
  }

  return res;
};

const shadowParserPenpot = (target: any) => {
  const res = [];
  let i = 0;

  for (const value of target.$value) {
    i++;
    res.push({
      blur: `${value.blur.value}${value.blur.unit}`,
      color: colorParser({ $type: "color", $value: value.color }).$value,
      offsetX: `${value.offsetX.value}${value.offsetX.unit}`,
      offsetY: `${value.offsetY.value}${value.offsetY.unit}`,
      spread: `${value.spread.value}${value.spread.unit}`,
    });
  }

  return {
    $type: "shadow",
    $value: res,
  };
};

const selectParsingFormat = (target: any, parser: ParserEnum) => {
  switch (parser) {
    case "figma":
      return shadowParserFigma(target);
    case "penpot":
      return shadowParserPenpot(target);
    case "tokensStudio":
      return shadowParserTokensStudio(target);
    default:
      throw `[shadow.ts]: Unimplemented parser: ${parser}`;
  }
};

export const parseShadow = (target: any, parser: ParserEnum) => {
  return (target[`${parser}`] = {
    ...selectParsingFormat(target, parser),
  });
};
