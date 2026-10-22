/**
 * Load the pinned Specs JSON Schema (devDependency @directededges/specs-schema, exact version)
 * and compile a validator for a Specs Component document.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import Ajv from 'ajv';

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

export function loadSpecsSchema() {
  const componentPath = createRequire(import.meta.url).resolve('@directededges/specs-schema/schema/component');
  const dir = path.dirname(componentPath);
  const { version } = readJson(path.join(dir, '..', 'package.json'));
  // draft-07 with cross-file refs by bare file name; strict off because the schema uses annotation keywords Ajv does not know.
  const ajv = new Ajv({ allErrors: true, strict: false });
  for (const f of ['styles', 'metadata', 'conventions', 'settings']) ajv.addSchema(readJson(path.join(dir, `${f}.schema.json`)), `${f}.schema.json`);
  return { version, validate: ajv.compile(readJson(componentPath)) };
}
