// Marked lines: highlighted, added, removed, an error and a warning.
import { createHighlighter } from 'shiki';
import theme from './web/shiki-theme.json' with { type: 'json' };

const highlighter = await createHighlighter({
  themes: ['github-light', 'github-dark'], // [!code --]
  themes: [theme], // [!code ++]
  langs: ['css', 'html', 'javascript'],
});

export function render(source, lang) {
  return highlighter.codeToHtml(source, { lang, theme: theme.name }); // [!code highlight]
}

render('a { color: red }', 'scss'); // [!code error]
render('<p>Hello</p>'); // [!code warning]
