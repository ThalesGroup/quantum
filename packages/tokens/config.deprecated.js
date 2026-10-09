import StyleDictionary from 'style-dictionary';

const distPath = 'dist/';
const tempDir = 'properties';

/**
 * Deprecated config:
 * - expects all deprecated tokens normalized into `properties`
 * - builds ONLY dist/tokens.js (single JS module)
 */
const createDeprecatedStyleDictionary = () => {
  return new StyleDictionary({
    log: { verbosity: 'verbose' },
    source: [
      `${tempDir}/**/*.json`,
    ],
    platforms: {
      js: {
        transformGroup: 'js',
        buildPath: distPath,
        files: [
          {
            destination: 'tokens.js',
            format: 'javascript/module',
            options: {
              outputReferences: true,
            },
          },
        ],
      },
    },
  });
};

console.log('\n\nBuilding deprecated tokens → dist/tokens.js ...');
await createDeprecatedStyleDictionary().buildAllPlatforms();

export default {};
