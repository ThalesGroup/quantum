import { ds, slot, el, screen } from '../lib/ds.mjs';
import { brand, heading, form, stack, columns, nameField, emailField, passwordField, forgotPassword, submit, secondary, separator, hint, legal, cover, GAPS, CHANGES } from '../lib/auth.mjs';

/** shadcn/ui block login-03: A login page with a muted background color. */
export const meta = {
  block: 'login-03',
  name: 'Login with a muted background',
  section: 'login',
  description: 'A login page with a muted background color.',
  changes: [CHANGES.forgot, CHANGES.brandIcons, CHANGES.heading],
  gaps: [GAPS.password, GAPS.card, GAPS.link, GAPS.separator],
};

export function render() {
  const card = slot(
    ds.card({ title: 'Welcome back', description: 'Login with your Apple or Google account', headingLevel: 2 }),
    form(stack(
      secondary('Login with Apple'),
      secondary('Login with Google'),
      separator('Or continue with'),
      emailField('login-03-email'),
      passwordField('login-03-password'),
      forgotPassword(),
      submit('Login'),
      hint("Don't have an account?", 'Sign up'),
    )),
  );
  return screen({ class: 'scr-auth', 'data-layout': 'centered', 'data-surface': 'sunken' },
    el('div', { class: 'scr-auth__panel scr-stack' }, el('div', { class: 'scr-auth__brand' }, brand()), card, legal()),
  );
}
