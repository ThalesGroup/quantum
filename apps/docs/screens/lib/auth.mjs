/**
 * Building blocks of the authentication screens (login, sign up): brand, fields, separators and
 * the lines of links under a form. Components come from the design system (lib/ds.mjs); the layout
 * classes (scr-*) from screens/screens.css.
 */
import { ds, el, link, text } from './ds.mjs';

/** The product mark: an icon tile and the product name, linking home. */
export function brand(name = 'Acme Inc.') {
  return el('a', { class: 'scr-brand', href: '#' }, el('span', { class: 'scr-brand__mark' }, ds.icon({ name: 'view_agenda', size: 'small' })), text(name));
}

/**
 * A heading with its lede (h1 by default: an authentication page has one heading). A lede given as
 * markup (a hint paragraph) is used as is; a string becomes a paragraph.
 */
export function heading(title, lede = null, { level = 1, align = 'center' } = {}) {
  const sub = !lede ? null : lede.startsWith('<') ? lede : el('p', { class: 'scr-lede' }, text(lede));
  return el('div', { class: 'scr-heading', 'data-align': align }, el(`h${level}`, { class: 'scr-title' }, text(title)), sub);
}

/** A native form: no script, the browser validates the required fields. */
export function form(...children) {
  return el('form', { class: 'scr-form', action: '#', method: 'post' }, ...children);
}

/** A vertical stack of fields and buttons; buttons stretch to its width. */
export const stack = (...children) => el('div', { class: 'scr-stack' }, ...children);

/** Fields side by side from a medium width, stacked below. */
export const columns = (...children) => el('div', { class: 'scr-columns' }, ...children);

export function nameField(id) {
  return ds.textField({ label: 'Full Name', placeholder: 'John Doe', required: true, id, name: 'name', attrs: { autocomplete: 'name' } });
}

export function emailField(id, { description = null } = {}) {
  return ds.textField({ label: 'Email', placeholder: 'm@example.com', required: true, id, name: 'email', description, attrs: { autocomplete: 'email', inputmode: 'email' } });
}

/**
 * A password field. The Text field renders type="text" and has no type property yet
 * (a Password field is a known gap): the screen says so.
 */
export function passwordField(id, { label = 'Password', description = null, autocomplete = 'current-password' } = {}) {
  return ds.textField({ label, required: true, id, name: id, description, attrs: { autocomplete } });
}

/** "Forgot your password?" under the password field (the original puts it on the label row). */
export const forgotPassword = () => el('p', { class: 'scr-hint', 'data-align': 'end' }, link('Forgot your password?'));

export function submit(label) {
  return ds.button({ label, type: 'submit' });
}

/** A secondary action (the original's outline buttons). */
export function secondary(label) {
  return ds.button({ label, emphasis: 'subtle' });
}

/** A horizontal rule with a label in the middle ("Or continue with"). */
export function separator(label) {
  return el('div', { class: 'scr-separator' }, ds.divider({}), el('span', { class: 'scr-separator__label' }, text(label)), ds.divider({}));
}

/** A short line with a link: "Don't have an account? Sign up". */
export function hint(sentence, label, { align = 'center' } = {}) {
  return el('p', { class: 'scr-hint', 'data-align': align }, text(sentence), ' ', link(label));
}

/** The legal line under the form. */
export function legal() {
  return el('p', { class: 'scr-hint scr-legal', 'data-align': 'center' }, 'By clicking continue, you agree to our ', link('Terms of Service'), ' and ', link('Privacy Policy'), '.');
}

/** A decorative cover image, drawn with tokens (no picture is reused from the original). */
export function cover() {
  return el('div', { class: 'scr-cover', 'aria-hidden': 'true' }, ds.icon({ name: 'landscape', size: 'large' }));
}

/** Gaps and changes the authentication screens share (shown on each screen's page). */
export const GAPS = {
  password: { text: 'Password fields are Text fields: the Text field has no input type yet, so the password shows as plain text.' },
  card: { text: 'The Card has no content part: the form is placed inside the Card root after its title and description.' },
  link: { text: 'Links are native links on semantic tokens: there is no Link component yet.' },
  separator: { text: 'The "Or continue with" separator is two Dividers around a label: the Divider has no label.' },
};
export const CHANGES = {
  brandIcons: 'Brand logos (Apple, Google, GitHub, Meta) are dropped: Material Symbols has none and no brand icon source is decided; the buttons keep their text.',
  forgot: '"Forgot your password?" sits under the password field: the Text field owns its label row.',
  cover: 'The cover image is a token-drawn placeholder.',
  heading: 'The card title is an h2: the Card heading level goes from 2 to 6.',
};
