import { ds, slot, el, screen } from '../lib/ds.mjs';
import { brand, heading, form, stack, columns, nameField, emailField, passwordField, forgotPassword, submit, secondary, separator, hint, legal, cover, GAPS, CHANGES } from '../lib/auth.mjs';

/** shadcn/ui block login-04: A login page with form and image. */
export const meta = {
  block: 'login-04',
  name: 'Login with form and image',
  section: 'login',
  description: 'A login page with form and image.',
  changes: [CHANGES.forgot, CHANGES.brandIcons, CHANGES.cover, 'The three icon-only brand buttons become text buttons (no brand icon to show).'],
  gaps: [GAPS.password, GAPS.card, GAPS.link, GAPS.separator, { text: 'A card with media: the Card has no media part, so the form and the cover share the Card root in a two-column layout.' }],
};

export function render() {
  const card = slot(
    ds.card({ title: 'Welcome back', description: 'Login to your Acme Inc account', headingLevel: 2 }),
    el('div', { class: 'scr-media-card' },
      form(stack(
        emailField('login-04-email'),
        passwordField('login-04-password'),
        forgotPassword(),
        submit('Login'),
        separator('Or continue with'),
        el('div', { class: 'scr-button-row' }, secondary('Apple'), secondary('Google'), secondary('Meta')),
        hint("Don't have an account?", 'Sign up'),
      )),
      el('div', { class: 'scr-media-card__media' }, cover()),
    ),
  );
  return screen({ class: 'scr-auth', 'data-layout': 'centered', 'data-surface': 'sunken' },
    el('div', { class: 'scr-auth__panel scr-auth__panel--wide scr-stack' }, card, legal()),
  );
}
