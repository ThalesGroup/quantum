/**
 * Foundations
 */

/* Primitive */
import { parseDimension } from "./dimension.ts";
import { parseStrokeStyle } from "./strokeStyle.ts";
import { parseColor } from "./color.ts";
import { parseFontFamily } from "./fontFamily.ts";
import { parseNumber } from "./number.ts";
import { parseTransition } from "./transition.ts";
import { parseAnimation } from "./animation.ts";
import { parseQtmOther } from "./qtm.other.ts";
import { parseQtmTextDecoration } from "./qtm.textDecoration.ts";
/* Composed */
import { parseShadow } from "./shadow.ts";
import { parseTypography } from "./typography.ts";

/* Types */
import type { ParserEnum } from "../../../utils/Types/index.ts";
import { parseDuration } from "./duration.ts";
import { parseEasing } from "./easing.ts";
import { parseFontWeight } from "./fontWeight.ts";
import { parseAlias } from "./alias.ts";

export const parseFoundation = (target: any, parserType: ParserEnum) => {
  // Exclude tokens defined as "exclude: true" in "$extensions" for the current parser type
  if (
    ["penpot", "figma", "tokensStudio"].some(
      (platform) => target.$extensions?.qtm?.[platform]?.exclude,
    )
  ) {
    return;
  }

  if (target.isAlias) {
    parseAlias(target, parserType);
    return;
  }

  switch (target.$type) {
    case "qtm.animation":
      parseAnimation(target, parserType);
      break;
    case "color":
      parseColor(target, parserType);
      break;
    case "qtm.other":
      parseQtmOther(target, parserType);
      break;
    case "dimension":
      parseDimension(target, parserType);
      break;
    case "duration":
      parseDuration(target, parserType);
      break;
    case "easing":
      parseEasing(target, parserType);
      break;
    case "fontFamily":
      parseFontFamily(target, parserType);
      break;
    case "fontWeight":
      parseFontWeight(target, parserType);
      break;
    case "number":
      parseNumber(target, parserType);
      break;
    case "shadow":
      parseShadow(target, parserType);
      break;
    case "strokeStyle":
      parseStrokeStyle(target, parserType);
      break;
    case "qtm.textDecoration":
      parseQtmTextDecoration(target, parserType);
      break;
    case "qtm.transition":
      parseTransition(target, parserType);
      break;
    case "typography":
      parseTypography(target, parserType);
      break;
    default:
      break;
  }
};

export default {
  parseFoundation,
};
