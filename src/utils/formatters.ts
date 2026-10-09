import {
  fillPenpotStructure,
  removePenpotDanglingAndFormatAliases,
  formatTokensForPenpot,
} from "./penpotFormatter.ts";

const formatters = {
  penpot: {
    fillPenpotStructure,
    removePenpotDanglingAndFormatAliases,
    formatTokensForPenpot,
    singleFile: true,
  },
};

export default formatters;
