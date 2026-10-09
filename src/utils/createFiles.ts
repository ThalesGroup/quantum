import * as fs from "fs";
import * as path from "path";
export const createFiles = (params: {
  parser: string;
  output: {
    format: "css" | "scss" | "json" | "xml";
    directory: string;
    path?: string;
    singleFile?: boolean;
  };
  data: {
    set: any;
    length: number;
  };
}) => {
  const { output, parser, data } = params;

  console.log("==========================================");
  console.log(`|        generating [${parser}] tokens       |`);
  console.log("==========================================");

  console.log(`- ${data.length} tokens`);

  console.log("Creating files: ");

  const outputDir = path.join(
    process.cwd(),
    output.path
      ? output.path
      : `${output.directory}/${{ tokensStudio: "tokens_studio" }[parser] ?? parser}`,
  );

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  if (!output.singleFile) {
    for (const key of Object.keys(data.set)) {
      fs.writeFile(
        `/${outputDir}/${key}.tokens.${output.format}`,
        JSON.stringify(
          {
            [key]: data.set[key],
          },
          null,
          2,
        ),
        (err: Error) => {
          if (err) {
            console.error(`- ❌ Error while writing ${key} file:`, err);
          } else {
            console.log(`- ✅ ${key}.json successfully created.`);
          }
        },
      );
    }
  }
  fs.writeFile(
    `/${outputDir}/tokens.json`,
    JSON.stringify(
      parser === "tokensStudio" ? { tokens: data.set } : data.set,
      null,
      2,
    ),
    (err: Error) => {
      if (err) {
        console.error("- ❌ Error while writing file:", err);
      } else {
        console.log("- ✅ output.json successfully created.");
      }
      console.log("\n");
    },
  );
};
