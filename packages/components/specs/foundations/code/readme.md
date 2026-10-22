# Code colors

> Syntax highlighting is an aid: the code reads the same **without** it.

Load the theme, then highlight with _any_ grammar:

- the theme lives in `web/shiki-theme.json`
- its colors are CSS variables, see [the Shiki docs](https://shiki.style/guide/load-theme)
- line states come from `web/foundations/code.css`

```js
import theme from './web/shiki-theme.json' with { type: 'json' };
const html = highlighter.codeToHtml(source, { lang: 'css', theme: theme.name });
```
