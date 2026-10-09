import StyleDictionary from 'style-dictionary';
import { fileHeader, formattedVariables } from 'style-dictionary/utils';

/**
 * Returns tokens sorted so that every token appears AFTER
 * all the tokens it references. Works for both string ({some.ref})
 * and object values ({ $value: '{some.ref}' }).
 */
function topologicalSort(tokens) {
  // Build a name → token map for fast lookup
  const byName = new Map(tokens.map(t => [t.name, t]));
  const visited = new Set();
  const sorted = [];

  function extractRefs(value) {
    if (typeof value !== 'string') return [];
    // Collect all {dot.path} references in a string value
    return [...value.matchAll(/\{([^}]+)\}/g)].map(m =>
      m[1].replace(/\./g, '-')   // match the name/kebab transform
    );
  }

  function visit(token) {
    if (visited.has(token.name)) return;
    visited.add(token.name);

    // Resolve any references this token's original value contains
    const raw = token.original.$value ?? token.original.value;
    const refs =
      typeof raw === 'string'
        ? extractRefs(raw)
        : Object.values(raw ?? {}).flatMap(v => extractRefs(String(v ?? '')));

    for (const refName of refs) {
      const dep = byName.get(refName);
      if (dep) visit(dep);          // ensure dependency is placed first
    }

    sorted.push(token);
  }

  for (const token of tokens) visit(token);
  return sorted;
}

StyleDictionary.registerTransform({
  name: 'dtcg/qtm-color',
  type: 'value',
  filter: (token, options) => token.$type === 'color',
  transform: (token) => {
    const tokenPath = token.path.join('-');
    
    // Match pattern: color-{colorname}-{number} but exclude 100
    // e.g., color-white-5, color-black-10, but NOT color-primary-100
    const opacityMatch = tokenPath.match(/^color-(white|black)-(\d+)$/);
    
    if (opacityMatch) {
      const [, colorName, opacityPercent] = opacityMatch;
      
      // Skip if it's 100 (full opacity, should use hex)
      if (opacityPercent !== '100') {
        const rgb = colorName === 'white' ? '255, 255, 255' : '0, 0, 0';
        const alpha = parseInt(opacityPercent) / 100;
        return `rgba(${rgb}, ${alpha})`;
      }
    }

    // Replace transparent srgb definition `{ colorSpace: 'srgb', components: [ 0, 0, 0 ], alpha: 0 }` with 'transparent'
    if (token.$value.colorSpace = 'srgb' && token.$value.alpha === 0) {
      return 'transparent';
    }
    
    // Default to hex for other colors (including -100 variants)
    return token.$value?.hex || token.$value;
  }
});

StyleDictionary.registerTransform({
  name: 'dtcg/qtm-color-android',
  type: 'value',
  filter: (token) => token.$type === 'color',
  transform: (token) => {
    const v = token.$value;

    // If the transform chain has already turned this into a string (e.g. 'transparent'), just pass it through.
    if (typeof v === 'string') {
      return v;
    }

    const hex = v?.hex;
    if (!hex) return token.$value;

    const h = hex.replace('#', '');

    // 8-digit already includes alpha → convert #rrggbbaa → #aarrggbb
    if (h.length === 8) {
      return `#${h.slice(6)}${h.slice(0, 6)}`;
    }

    if (h.length === 6) {
      // Derive alpha from token if available, otherwise assume fully opaque
      const alpha = typeof v.alpha === 'number' ? v.alpha : 1;
      const alphaInt = Math.round(alpha * 255);
      const alphaHex = alphaInt.toString(16).padStart(2, '0');
      return `#${alphaHex}${h}`;
    }

    return hex;
  },
});

StyleDictionary.registerTransform({
  name: 'dtcg/qtm-shadow',
  type: 'value',
  filter: (token, options) => token.$type === 'shadow',
  transform: (token) => {
    const shadows = Array.isArray(token.$value) ? token.$value : [token.$value];
    
    return shadows.map(shadow => {
      const { offsetX, offsetY, blur, spread, color } = shadow;
      
      // Extract values with units, use 0 without unit if value is 0
      const _offsetX = offsetX.value === 0 ? '0' : `${offsetX.value}${offsetX.unit}`;
      const _offsetY = offsetY.value === 0 ? '0' : `${offsetY.value}${offsetY.unit}`;
      const _blur = blur.value === 0 ? '0' : `${blur.value}${blur.unit}`;
      const _spread = spread.value === 0 ? '0' : `${spread.value}${spread.unit}`;
      
      // Convert color to hsla format
      const [h, s, l] = color.components;
      const a = color.alpha;
      const colorStr = `hsla(${h}, ${s}%, ${l}%, ${a.toFixed(2)})`;
      
      return `${_offsetX} ${_offsetY} ${_blur} ${_spread} ${colorStr}`;
    }).join(', ');
  }
});

StyleDictionary.registerTransform({
  name: 'dtcg/qtm-unit',
  type: 'value',
  filter: (token, options) => token.$type === 'dimension' || token.$type === 'ratio' || token.$type === 'duration',
  transform: (token) => {
    return `${token.$value.value}${token.$value.unit}`;
  }
});

StyleDictionary.registerTransform({
  name: 'dtcg/qtm-transition',
  type: 'value',
  filter: (token) => token.$type === 'qtm.transition',
  transform: (token) => {
    const v = token.$value;
    return {
      delay:    v.delay?.unit    !== undefined ? `${v.delay.value}${v.delay.unit}`       : v.delay,
      duration: v.duration?.unit !== undefined ? `${v.duration.value}${v.duration.unit}` : v.duration,
      property: v.properties.join(', '),
      timing:   v.timingFunction,
    };
  }
});

StyleDictionary.registerTransform({
  name: 'dtcg/qtm-animation',
  type: 'value',
  filter: (token) => token.$type === 'qtm.animation',
  transform: (token) => {
    const v = token.$value;
    return {
      duration:       v.duration?.unit !== undefined
                        ? `${v.duration.value}${v.duration.unit}`
                        : v.duration?.value ?? v.duration,
      iterationCount: v.interaction?.count?.value?.value,
      name:           v.name?.value,
      timingFunction: v.timing?.function?.value?.value,
    };
  }
});

StyleDictionary.registerFileHeader({
  name: 'myCustomHeader',
  fileHeader: () => {
    return ['Do not edit directly', `Generated on ${new Date()}`]
  },
});

StyleDictionary.registerFormat({
  name: "qtm/android/resources",
  format: async ({ dictionary, options, file }) => {
    const { outputReferences } = options;
    const header = await fileHeader({ file });

    const toSnakeCase = (name) => name.replace(/-/g, "_");

    // Specific renaming for dark background tokens
    const androidTokenName = (token) =>
      token.name
        .replace(/^color-dark-background/, 'color-background')
        .replace(/^color-dark-font-on-background/, 'color-font-on-background');

    // “Semantic color” = lives under color.* namespace
    const isSemanticColorToken = (token) =>
      androidTokenName(token).startsWith("color-") && token.$value && typeof token.$value === 'string';

    const lines = [];
    const allTokens = topologicalSort(dictionary.allTokens);

    allTokens.forEach((token) => {
      const logicalName = androidTokenName(token);
      const baseResourceName = toSnakeCase(logicalName);

      const originalValue = token.original.$value ?? token.original.value;

      // Typography tokens are split into properties
      if (token.$type === 'typography') {
        const value = token.original.$value;

        const propertyMap = {
          lineHeight: 'line_height',
          fontSize: 'size',
          fontWeight: 'font_weight',
          fontFamily: 'font_family',
          // intentionally no letterSpacing
        };

        Object.entries(propertyMap).forEach(([prop, suffix]) => {
          const val = value?.[prop];
          if (!val) return;

          let outputValue;

          if (
            outputReferences &&
            typeof val === 'string' &&
            val.startsWith('{') &&
            val.endsWith('}')
          ) {
            // produce @string/... references, mirroring other Android references
            const refPath = val.slice(1, -1); // e.g. "font.family.roboto"
            const refName = refPath
              .replace(/\./g, '_')   // e.g. font.family.roboto -> font_family_roboto
              .replace(/-/g, '_');    // e.g. roboto-mono -> roboto_mono
            outputValue = `@string/${refName}`;
          } else if (val?.value !== undefined) {
            // Dimension object
            outputValue = `${val.value}${val.unit || ''}`;
          } else {
            outputValue = val;
          }

          lines.push(
            `  <string name="${baseResourceName}_${suffix}">${outputValue}</string>`
          );
        });
        return;
      }

      // Transition tokens are split into multiple string resources
      if (token.$type === 'qtm.transition') {
        const { delay, duration, property, timing } = token.$value || {};

        if (delay !== undefined) {
          lines.push(
            `  <string name="${baseResourceName}_delay">${delay}</string>`
          );
        }
        if (duration !== undefined) {
          lines.push(
            `  <string name="${baseResourceName}_duration">${duration}</string>`
          );
        }
        if (property !== undefined) {
          lines.push(
            `  <string name="${baseResourceName}_property">${property}</string>`
          );
        }
        if (timing !== undefined) {
          lines.push(
            `  <string name="${baseResourceName}_timing">${timing}</string>`
          );
        }
        return;
      }

      // Animation tokens are split into multiple string resources
      if (token.$type === 'qtm.animation') {
        const { duration, iterationCount, name, timingFunction } = token.$value || {};

        if (duration !== undefined) {
          lines.push(
            `  <string name="${baseResourceName}_animation_duration">${duration}</string>`
          );
        }
        if (iterationCount !== undefined) {
          lines.push(
            `  <string name="${baseResourceName}_animation_iteration_count">${iterationCount}</string>`
          );
        }
        if (name !== undefined) {
          lines.push(
            `  <string name="${baseResourceName}_animation_name">${name}</string>`
          );
        }
        if (timingFunction !== undefined) {
          lines.push(
            `  <string name="${baseResourceName}_animation_timing_function">${timingFunction}</string>`
          );
        }
        return;
      }

      const tag = isSemanticColorToken(token)
        ? "color"
        : token.$type === "color" && typeof token.$value === 'string'
          ? "color"
          : "string";

      const resourceName = baseResourceName;

      let value;

      if (
        outputReferences &&
        typeof originalValue === "string" &&
        originalValue.startsWith("{") &&
        originalValue.endsWith("}")
      ) {
        const refPath = originalValue.slice(1, -1);
        const refName = refPath.replace(/\./g, "-");
        const refSnake = toSnakeCase(refName);

        // Preserve original behavior: semantic color tokens use @color/..., others @string/...
        const refTag = isSemanticColorToken(token) ? 'color' : 'string';
        value = `@${refTag}/${refSnake}`;
      } else {
        // If $value is already a scalar (string/number), use it.
        if (typeof token.$value === 'string' || typeof token.$value === 'number') {
          value = token.$value;
        } else if (
          // Fallback: normalize fully transparent srgb objects to 'transparent'
          token.$type === 'color' &&
          token.$value &&
          token.$value.colorSpace === 'srgb' &&
          token.$value.alpha === 0
        ) {
          value = 'transparent';
        } else {
          // Last resort: original raw value
          value = originalValue;
        }
      }

      lines.push(`  <${tag} name="${resourceName}">${value}</${tag}>`);
    });

    return (
      header +
      `<?xml version="1.0" encoding="utf-8"?>\n<!--
  Do not edit directly
  Generated on ${new Date()}
-->\n<resources>\n` +
      lines.join("\n") +
      "\n</resources>\n"
    );
  },
});

StyleDictionary.registerFormat({
  name: 'scss/variables-with-typography',
  format: async ({ dictionary, options, file }) => {
    const { outputReferences } = options;
    const header = await fileHeader({ file, options });
    let output = header;

    // Sort once — all subsequent filters preserve this order
    const allTokens = topologicalSort(dictionary.allTokens);

    const typographyTokens = allTokens.filter(t => t.$type === 'typography');
    const transitionTokens = allTokens.filter(t => t.$type === 'qtm.transition');
    const animationTokens  = allTokens.filter(t => t.$type === 'qtm.animation');
    const otherTokens      = allTokens.filter(
      t => !['typography', 'qtm.transition', 'qtm.animation'].includes(t.$type)
    );
    
    // Manually format non-typography/qtm.transition/qtm.animation tokens
    otherTokens.forEach(token => {
      let value;
      
      if (outputReferences && token.original.$value && typeof token.original.$value === 'string' && token.original.$value.startsWith('{')) {
        // Output as reference
        value = '$' + token.original.$value.slice(1, -1).replace(/\./g, '-');
      } else {
        // Use the transformed value
        value = token.$value;
      }
      
      // Strip the "dark-" segment inserted by the foundation file naming convention
      const tokenName = (token) => token.name.replace(/^color-dark-background/, 'color-background').replace(/^color-dark-font-on-background/, 'color-font-on-background');
      
      output += `$${tokenName(token)}: ${value};\n`;
    });
    
    // Add typography tokens split into properties
    typographyTokens.forEach(token => {
      const baseKey = token.name;
      const value = token.original.$value;
      
      const propertyMap = {
        'lineHeight': 'line-height',
        'fontSize': 'size',
        'fontWeight': 'font-weight',
        'fontFamily': 'font-family',
        // Voluntarily don't export 'letterSpacing'
      };
      
      Object.entries(propertyMap).forEach(([prop, suffix]) => {
        if (value[prop]) {
          const val = value[prop];
          let outputValue;
          
          if (typeof val === 'string' && val.startsWith('{') && outputReferences) {
            // Convert reference to Sass variable
            outputValue = '$' + val.slice(1, -1).replace(/\./g, '-');
          } else if (val?.value !== undefined) {
            // Handle dimension objects
            outputValue = `${val.value}${val.unit || ''}`;
          } else {
            outputValue = val;
          }
          
          output += `$${baseKey}-${suffix}: ${outputValue};\n`;
        }
      });
    });

    // Add transition tokens split into properties
    transitionTokens.forEach(token => {
      const { delay, duration, property, timing } = token.$value;
      const base = token.name;

      output += `$${base}-delay: ${delay};\n`;
      output += `$${base}-duration: ${duration};\n`;
      output += `$${base}-property: ${property};\n`;
      output += `$${base}-timing: ${timing};\n`;
    });

    // Add animation tokens split into properties
    animationTokens.forEach(token => {
      const { duration, iterationCount, name, timingFunction } = token.$value;
      const base = token.name;

      if (duration       !== undefined) output += `$${base}-animation-duration: ${duration};\n`;
      if (iterationCount !== undefined) output += `$${base}-animation-iteration-count: ${iterationCount};\n`;
      if (name           !== undefined) output += `$${base}-animation-name: ${name};\n`;
      if (timingFunction !== undefined) output += `$${base}-animation-timing-function: ${timingFunction};\n`;
    });
    
    return output;
  }
});

StyleDictionary.registerFormat({
  name: "css/variables-themed",
  format: async ({ dictionary, options, file }) => {
    const { outputReferences, theme } = options;
    const header = await fileHeader({ file });

    const allTokens = topologicalSort(dictionary.allTokens);

    const typographyTokens = allTokens.filter(t => t.$type === 'typography');
    const transitionTokens = allTokens.filter(t => t.$type === 'qtm.transition');
    const animationTokens  = allTokens.filter(t => t.$type === 'qtm.animation');
    const otherTokens      = allTokens.filter(
      t => !['typography', 'transition', 'qtm.animation'].includes(t.$type)
    );

    let output = header + `${theme !== 'dark' ? ':root' : `.dark`} {\n`;

    // Helper to rewrite dark->light naming if needed
    const cssTokenName = (token) =>
      token.name
        .replace(/^color-dark-background/, 'color-background')
        .replace(/^color-dark-font-on-background/, 'color-font-on-background');

    // Other tokens (simple key/value)
    otherTokens.forEach(token => {
      let value;
      if (
        outputReferences &&
        token.original.$value &&
        typeof token.original.$value === 'string' &&
        token.original.$value.startsWith('{')
      ) {
        // CSS var() outputs
        const ref = token.original.$value.slice(1, -1).replace(/\./g, '-');
        value = `var(--${ref})`;
      } else {
        value = token.$value;
      }
      output += `  --${cssTokenName(token)}: ${value};\n`;
    });

    // Typography as split properties
    typographyTokens.forEach(token => {
      const baseKey = cssTokenName(token);
      const value = token.original.$value;
      const propertyMap = {
        'lineHeight': 'line-height',
        'fontSize': 'size',
        'fontWeight': 'font-weight',
        'fontFamily': 'font-family',
        // don't export 'letterSpacing'
      };

      Object.entries(propertyMap).forEach(([prop, suffix]) => {
        if (value[prop]) {
          const val = value[prop];
          let outputValue;

          if (typeof val === 'string' && val.startsWith('{') && outputReferences) {
            const ref = val.slice(1, -1).replace(/\./g, '-');
            outputValue = `var(--${ref})`;
          } else if (val?.value !== undefined) {
            outputValue = `${val.value}${val.unit || ''}`;
          } else {
            outputValue = val;
          }

          output += `  --${baseKey}-${suffix}: ${outputValue};\n`;
        }
      });
    });

    // Transition split properties
    transitionTokens.forEach(token => {
      const { delay, duration, property, timing } = token.$value;
      const base = cssTokenName(token);

      output += `  --${base}-delay: ${delay};\n`;
      output += `  --${base}-duration: ${duration};\n`;
      output += `  --${base}-property: ${property};\n`;
      output += `  --${base}-timing: ${timing};\n`;
    });

    // Animation split properties
    animationTokens.forEach(token => {
      const { duration, iterationCount, name, timingFunction } = token.$value;
      const base = cssTokenName(token);

      if (duration !== undefined)
        output += `  --${base}-animation-duration: ${duration};\n`;
      if (iterationCount !== undefined)
        output += `  --${base}-animation-iteration-count: ${iterationCount};\n`;
      if (name !== undefined)
        output += `  --${base}-animation-name: ${name};\n`;
      if (timingFunction !== undefined)
        output += `  --${base}-animation-timing-function: ${timingFunction};\n`;
    });

    output += "}\n";
    return output;
  },
});

StyleDictionary.registerFormat({
  name: 'js/custom',
  format: ({ dictionary }) => {
    const allTokens = dictionary.allTokens;

    const animationTokens  = allTokens.filter(t => t.$type === 'qtm.animation');
    const transitionTokens = allTokens.filter(t => t.$type === 'qtm.transition');
    const typographyTokens = allTokens.filter(t => t.$type === 'typography');
    const otherTokens      = allTokens.filter(
      t => !['qtm.animation', 'qtm.transition', 'typography'].includes(t.$type)
    );

    const tokens = [];

    const toCamel = (name) =>
      name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

    const pushVar = (logicalName, cssPath) => {
      const varName = toCamel(logicalName);

      // Normalize some known inconsistent CSS variable paths
      let path = cssPath;

      // Fix color.font.onBackground.default → color-font-on-background-default
      if (path === 'color-font-onBackground-default') {
        path = 'color-font-on-background-default';
      }

      // Fix drawer ... padding-leftOverride / padding-leftoverride → padding-left-override
      if (path.endsWith('padding-leftOverride')) {
        path = path.replace('padding-leftOverride', 'padding-left-override');
      }
      if (path.includes('minWidth')) {
        path = path.replace('minWidth', 'min-width');
      }
      if (path.includes('maxWidth')) {
        path = path.replace('maxWidth', 'max-width');
      }

      const cssToken = `--${path}`;
      tokens.push({
        name: varName,
        value: `const ${varName} = "${cssToken}"`,
      });
    };

    animationTokens.forEach(token => {
      const { duration, iterationCount, name, timingFunction } = token.$value || {};
      const basePath = token.path.join('-');
      const baseName = token.name;

      if (duration !== undefined) {
        pushVar(`${baseName}-animation-duration`, `${basePath}-animation-duration`);
      }
      if (iterationCount !== undefined) {
        pushVar(`${baseName}-animation-iteration-count`, `${basePath}-animation-iteration-count`);
      }
      if (name !== undefined) {
        pushVar(`${baseName}-animation-name`, `${basePath}-animation-name`);
      }
      if (timingFunction !== undefined) {
        pushVar(`${baseName}-animation-timing-function`, `${basePath}-animation-timing-function`);
      }
    });

    transitionTokens.forEach(token => {
      const { delay, duration, property, timing } = token.$value || {};
      const basePath = token.path.join('-');
      const baseName = token.name;

      if (delay !== undefined) {
        pushVar(`${baseName}-delay`, `${basePath}-delay`);
      }
      if (duration !== undefined) {
        pushVar(`${baseName}-duration`, `${basePath}-duration`);
      }
      if (property !== undefined) {
        pushVar(`${baseName}-property`, `${basePath}-property`);
      }
      if (timing !== undefined) {
        pushVar(`${baseName}-timing`, `${basePath}-timing`);
      }
    });

    typographyTokens.forEach(token => {
      const value = token.original.$value;
      const basePath = token.path.join('-');
      const baseName = token.name;

      const propertyMap = {
        lineHeight: 'line-height',
        fontSize: 'size',
        fontWeight: 'font-weight',
        fontFamily: 'font-family',
      };

      Object.entries(propertyMap).forEach(([prop, suffix]) => {
        if (value[prop]) {
          pushVar(`${baseName}-${suffix}`, `${basePath}-${suffix}`);
        }
      });
    });

    otherTokens.forEach(token => {
      const basePath = token.path.join('-');
      const baseName = token.name;
      pushVar(baseName, basePath);
    });

    return `${tokens.map((token) => token.value).join('\n')} \n\nmodule.exports = {\n    ${tokens
      .map((token) => token.name)
      .join(',\n    ')}\n}\n`;
  },
});

StyleDictionary.registerFormat({
  name: 'javascript/es6-pascal',
  format: ({ dictionary }) => {
    const toPascal = (name) =>
      name
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

    const lines = [];

    dictionary.allTokens.forEach(token => {
      // Helper to normalize name with dark-color handling
      const normalizedName =
        dictionary.options?.mode === 'dark'
          ? token.name
          : token.name
              .replace(/^color-dark-background/, 'color-background')
              .replace(/^color-dark-font-on-background/, 'color-font-on-background');

      // Special handling for animation tokens: split into multiple constants
      if (token.$type === 'qtm.animation') {
        const v = token.$value || token.original?.$value || token.original?.value || {};
        const base = normalizedName;

        const parts = [
          ['duration',       'AnimationDuration',       v.duration],
          ['iterationCount', 'AnimationIterationCount', v.iterationCount],
          ['name',           'AnimationName',           v.name],
          ['timingFunction', 'AnimationTimingFunction', v.timingFunction],
        ];

        parts.forEach(([key, suffix, raw]) => {
          if (raw === undefined) return;

          let value = raw;

          // Coerce primitives to string to match legacy ES6 behavior
          if (typeof value === 'number' || typeof value === 'boolean') {
            value = String(value);
          }

          // Normalize hex strings to lowercase
          if (typeof value === 'string' && /^#?[0-9A-Fa-f]{6,8}$/.test(value)) {
            value = value.toLowerCase();
          }

          const constName = toPascal(`${base}-${suffix}`);
          lines.push(`export const ${constName} = ${JSON.stringify(value)};`);
        });

        return;
      }

      // Special handling for transition tokens: split into multiple constants
      if (token.$type === 'qtm.transition') {
        const v = token.$value || token.original?.$value || token.original?.value || {};
        const base = `${normalizedName}`;

        const parts = [
          ['delay',    'Delay',    v.delay],
          ['duration', 'Duration', v.duration],
          ['property', 'Property', v.property],
          ['timing',   'Timing',   v.timing],
        ];

        parts.forEach(([key, suffix, raw]) => {
          if (raw === undefined) return;

          let value = raw;

          // Coerce primitives to string to match legacy ES6 behavior
          if (typeof value === 'number' || typeof value === 'boolean') {
            value = String(value);
          }

          // Normalize hex strings to lowercase
          if (typeof value === 'string' && /^#?[0-9A-Fa-f]{6,8}$/.test(value)) {
            value = value.toLowerCase();
          }

          const constName = toPascal(`${base}-${suffix}`);
          lines.push(`export const ${constName} = ${JSON.stringify(value)};`);
        });

        return;
      }

      // Special handling for typography tokens: split into multiple constants
      if (token.$type === 'typography') {
        const v = token.$value || token.original?.$value || token.original?.value || {};
        const base = normalizedName;

        const parts = [
          ['fontFamily', 'FontFamily', v.fontFamily],
          ['fontWeight', 'FontWeight', v.fontWeight],
          ['lineHeight', 'LineHeight', v.lineHeight],
          ['fontSize',   'Size',       v.fontSize],
        ];

        parts.forEach(([key, suffix, raw]) => {
          if (raw === undefined) return;

          let value = raw;

          // If value is a dimension object (e.g. { value, unit }), convert to string
          if (value && typeof value === 'object' && 'value' in value) {
            value = `${value.value}${value.unit || ''}`;
          }

          // Coerce primitives to string to match legacy ES6 behavior
          if (typeof value === 'number' || typeof value === 'boolean') {
            value = String(value);
          }

          // Normalize hex strings to lowercase (probably not used here but keep consistent)
          if (typeof value === 'string' && /^#?[0-9A-Fa-f]{6,8}$/.test(value)) {
            value = value.toLowerCase();
          }

          const constName = toPascal(`${base}-${suffix}`);
          lines.push(`export const ${constName} = ${JSON.stringify(value)};`);
        });

        return;
      }

      const constName = toPascal(normalizedName);

      // Prefer transformed value; fall back to original.$value / original.value
      let value =
        token.value !== undefined
          ? token.value
          : token.$value !== undefined
            ? token.$value
            : token.original?.$value ?? token.original?.value;

      // Coerce primitive values to strings to match legacy ES6 output
      if (typeof value === 'number' || typeof value === 'boolean') {
        value = String(value);
      }

      // For ES6, collapse any rgba white/black to solid hex, matching legacy behavior
      if (typeof value === 'string') {
        const m = value.match(
          /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(0(?:\.\d+)?|1(?:\.0+)?)\s*\)$/
        );
        if (m) {
          const r = Number(m[1]);
          const g = Number(m[2]);
          const b = Number(m[3]);
          if (r === 255 && g === 255 && b === 255) {
            value = '#ffffff';
          } else if (r === 0 && g === 0 && b === 0) {
            value = '#000000';
          }
        }
      }

      // Normalize hex strings to lowercase for ES6 output
      if (typeof value === 'string' && /^#?[0-9A-Fa-f]{6,8}$/.test(value)) {
        value = value.toLowerCase();
      }

      lines.push(`export const ${constName} = ${JSON.stringify(value)};`);
    });

    return [
      '/**',
      ' * Do not edit directly',
      ` * Generated on ${new Date().toUTCString()}`,
      ' */',
      '',
      ...lines,
      '',
    ].join('\n');
  },
});

StyleDictionary.registerFormat({
  name: 'typescript/es6-declarations-with-spacing',
  format: ({ dictionary }) => {
    const toPascal = (name) =>
      name
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

    const lines = [];

    dictionary.allTokens.forEach(token => {
      const normalizedName =
        dictionary.options?.mode === 'dark'
          ? token.name
          : token.name
              .replace(/^color-dark-background/, 'color-background')
              .replace(/^color-dark-font-on-background/, 'color-font-on-background');

      // Animation: split into multiple declarations
      if (token.$type === 'qtm.animation') {
        const base = normalizedName;
        const parts = [
          ['duration',       'AnimationDuration'],
          ['iterationCount', 'AnimationIterationCount'],
          ['name',           'AnimationName'],
          ['timingFunction', 'AnimationTimingFunction'],
        ];

        parts.forEach(([, suffix]) => {
          const constName = toPascal(`${base}-${suffix}`);
          lines.push(`export const ${constName} : string;`);
        });
        return;
      }

      // Transition: split into multiple declarations
      if (token.$type === 'qtm.transition') {
        const base = `${normalizedName}`;
        const parts = [
          ['delay',    'Delay'],
          ['duration', 'Duration'],
          ['property', 'Property'],
          ['timing',   'Timing'],
        ];

        parts.forEach(([, suffix]) => {
          const constName = toPascal(`${base}-${suffix}`);
          lines.push(`export const ${constName} : string;`);
        });
        return;
      }

      // Typography: split into multiple declarations
      if (token.$type === 'typography') {
        const base = normalizedName;
        const parts = [
          ['fontFamily', 'FontFamily'],
          ['fontWeight', 'FontWeight'],
          ['lineHeight', 'LineHeight'],
          ['fontSize',   'Size'],
        ];

        parts.forEach(([, suffix]) => {
          const constName = toPascal(`${base}-${suffix}`);
          lines.push(`export const ${constName} : string;`);
        });
        return;
      }

      // Default: one declaration per token
      const constName = toPascal(normalizedName);
      lines.push(`export const ${constName} : string;`);
    });

    return [
      '/**',
      ' * Do not edit directly',
      ` * Generated on ${new Date().toUTCString()}`,
      ' */',
      '',
      ...lines,
      '',
    ].join('\n');
  },
});

const foundationSource = [
  "dtcg/foundation/border.tokens.json",
  "dtcg/foundation/breakpoint.tokens.json",
  "dtcg/foundation/color.tokens.json",
  "dtcg/foundation/color.extended.tokens.json",
  "dtcg/foundation/container.tokens.json",
  "dtcg/foundation/font.tokens.json",
  "dtcg/foundation/grids.tokens.json",
  "dtcg/foundation/icon.tokens.json",
  "dtcg/foundation/shadow.tokens.json",
  "dtcg/foundation/spacing.tokens.json",
  "dtcg/foundation/typography.tokens.json",
]

const baseTransforms = [
  // Style Dictionary
  'name/kebab',
  // Custom
  'dtcg/qtm-color',
  'dtcg/qtm-shadow',
  'dtcg/qtm-unit',
  'dtcg/qtm-transition',
  'dtcg/qtm-animation',
];

const componentNames = [
  "alert",
  "breadcrumbs",
  "button",
  "checkbox",
  "checkboxgroup",
  "datatable",
  "dataviz",
  "dialog",
  "divider",
  "drawer",
  "dropdown",
  "formfield",
  "header",
  "input",
  "itemlist",
  "progress",
  "radio",
  "radiogroup",
  "slider",
  "splitbutton",
  "switch",
  "tabs",
  "tags",
  "textarea",
  "tooltip",
];

const platforms = {
  android: (suffix, isDark, t) => ({
    transforms: t.map(transform => transform === 'dtcg/qtm-color' ? 'dtcg/qtm-color-android' : transform),
    buildPath: "dist/",
    files: [
      {
        destination: `resources${suffix}.xml`,
        format: "qtm/android/resources",
        filter: isDark
          ? (token) =>
              token.filePath.includes("-dark.tokens.json") ||
              token.name.includes("color-dark-background-default") ||
              token.name.includes("color-dark-font-on-background-default")
          : (token) =>
              !token.filePath.includes("-dark.tokens.json") &&
              !token.name.includes("color-dark-background-default") &&
              !token.name.includes("color-dark-font-on-background-default"),
        options: {
          outputReferences: true,
          usesDtcg: true,
          showFileHeader: false,
        },
      },
    ],
  }),
  scss: (suffix, isDark, transforms) => ({
    transforms,
    buildPath: "dist/",
    files: [
      {
        destination: `tokens${suffix}.scss`,
        format: "scss/variables-with-typography",
        filter: isDark
          ? (token) =>
              token.filePath.includes("-dark.tokens.json") ||
              token.name.includes("color-dark-background-default") ||
              token.name.includes("color-dark-font-on-background-default")
          : (token) =>
              !token.filePath.includes("-dark.tokens.json") &&
              !token.name.includes("color-dark-background-default") &&
              !token.name.includes("color-dark-font-on-background-default"),
        options: {
          outputReferences: true,
          ...(isDark && { outputReferencesTransformed: false }),
          fileHeader: "myCustomHeader",
        },
      },
    ],
  }),
  css: (suffix, isDark, transforms) => ({
    transforms,
    buildPath: "dist/",
    files: [
      {
        destination: `tokens${suffix}.css`,
        format: "css/variables-themed",
        filter: isDark
          ? (token) =>
              token.filePath.includes("-dark.tokens.json") ||
              token.name.includes("color-dark-background-default") ||
              token.name.includes("color-dark-font-on-background-default")
          : (token) =>
              !token.filePath.includes("-dark.tokens.json") &&
              !token.name.includes("color-dark-background-default") &&
              !token.name.includes("color-dark-font-on-background-default"),
        options: {
          outputReferences: true,
          ...(isDark && { outputReferencesTransformed: false }),
          theme: isDark ? "dark" : "light",
          fileHeader: "myCustomHeader",
        },
      },
    ],
  }),
  'js-variables-css': (suffix, isDark, transforms) => (
    isDark
      ? null // skip this platform entirely for dark mode
      : {
          transforms,
          buildPath: 'dist/',
          files: [
            {
              destination: 'variables-css.js',
              format: 'js/custom',
              filter: (token) =>
                !token.filePath.includes('-dark.tokens.json') &&
                !token.name.includes('color-dark-background-default') &&
                !token.name.includes('color-dark-font-on-background-default'),
            },
          ],
        }
  ),
  ts6: (suffix, isDark, transforms) => ({
    // Use camel case just for the generated JS identifiers
    transforms: ['name/camel', ...transforms],
    buildPath: 'dist/',
    files: [
      {
        format: 'javascript/es6-pascal',
        destination: `tokens-es6${suffix}.js`,
        filter: isDark
          ? (token) =>
              token.filePath.includes('-dark.tokens.json') ||
              token.name.includes('color-dark-background-default') ||
              token.name.includes('color-dark-font-on-background-default')
          : (token) =>
              !token.filePath.includes('-dark.tokens.json') &&
              !token.name.includes('color-dark-background-default') &&
              !token.name.includes('color-dark-font-on-background-default'),
      },
      {
        format: 'typescript/es6-declarations-with-spacing',
        destination: `tokens-es6${suffix}.d.ts`,
        filter: isDark
          ? (token) =>
              token.filePath.includes('-dark.tokens.json') ||
              token.name.includes('color-dark-background-default') ||
              token.name.includes('color-dark-font-on-background-default')
          : (token) =>
              !token.filePath.includes('-dark.tokens.json') &&
              !token.name.includes('color-dark-background-default') &&
              !token.name.includes('color-dark-font-on-background-default'),
      },
    ],
  }),
};

const createStyleDictionary = (mode = "light", activePlatforms = platforms) => {
  const isDark = mode === "dark";
  const suffix = isDark ? "-dark" : "";

  const componentSources = componentNames.map(
    (name) => `dtcg/component/${name}${suffix}.tokens.json`
  );

  const resolvedPlatforms = Object.fromEntries(
    Object.entries(activePlatforms)
      .map(([key, builder]) => {
        const transforms = baseTransforms;
        return [key, builder(suffix, isDark, transforms)];
      })
      .filter(([, value]) => value != null)
  );

  return new StyleDictionary({
    usesDtcg: true,
    source: [...foundationSource, ...componentSources],
    platforms: resolvedPlatforms,
  });
};

// Build all modes
for (const mode of ["light", "dark"]) {
  await createStyleDictionary(mode).buildAllPlatforms();
}

export default {}
