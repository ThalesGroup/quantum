import { ds, slot, el, screen } from '../lib/ds.mjs';
import { brand, heading, form, stack, columns, nameField, emailField, passwordField, forgotPassword, submit, secondary, separator, hint, legal, cover, GAPS, CHANGES } from '../lib/auth.mjs';

/** shadcn/ui block login-01: A simple login form. */
export const meta = {
  block: 'login-01',
  name: 'Login form in a card',
  section: 'login',
  description: 'A simple login form.',
  changes: [CHANGES.forgot, CHANGES.heading],
  gaps: [GAPS.password, GAPS.card, GAPS.link],
};

export function render() {
  const card = slot(
    ds.card({ title: 'Login to your account', description: 'Enter your email below to login to your account', headingLevel: 2 }),
    form(stack(
      emailField('login-01-email'),
      passwordField('login-01-password'),
      forgotPassword(),
      submit('Login'),
      secondary('Login with Google'),
      hint("Don't have an account?", 'Sign up'),
    )),
  );
  return screen({ class: 'scr-auth', 'data-layout': 'centered' }, el('div', { class: 'scr-auth__panel' }, card));
}
