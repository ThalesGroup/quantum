/**
 * The published files of @quantum-ds/components: every JSON file of the specs directory (component
 * and foundation specs, their schemas, the accessibility registry, the platform vocabulary) and the
 * code samples foundation examples show (examples[].source). Nothing else: no agent guide, no web
 * implementation. Pure: the caller lists the files and reads the specs.
 */

/**
 * @param {string[]} files paths relative to the specs directory, '/'-separated
 * @param {(file: string) => object} readJson parses one of those files
 * @param {string} specsPath the specs directory, repository-relative (sample sources are repository-relative)
 * @returns {{ outputs: string[], problems: string[] }} the files to publish, relative to the specs
 *   directory and to dist alike (same layout), sorted; and the sample sources that are missing
 */
export function planSpecOutputs(files, readJson, specsPath) {
  const listed = new Set(files);
  const outputs = new Set(files.filter((f) => f.endsWith('.json')));
  const problems = [];
  for (const file of files.filter((f) => /^foundations\/[^/]+\.spec\.json$/.test(f))) {
    for (const example of readJson(file).examples ?? []) {
      if (!example.source) continue;
      const rel = example.source.startsWith(`${specsPath}/`) ? example.source.slice(specsPath.length + 1) : null;
      if (rel && listed.has(rel)) outputs.add(rel);
      else problems.push(`${file}: example "${example.id}" shows ${example.source}, which is not a file of ${specsPath}/`);
    }
  }
  return { outputs: [...outputs].sort(), problems };
}
