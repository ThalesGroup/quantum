import { ds, slot, el, screen } from '../lib/ds.mjs';
import { brand, heading, form, stack, columns, nameField, emailField, passwordField, forgotPassword, submit, secondary, separator, hint, legal, cover, GAPS, CHANGES } from '../lib/auth.mjs';

/** shadcn/ui block login-05: A simple email-only login page. */
export const meta = {
  block: 'login-05',
  name: 'Email-only login',
  section: 'login',
  description: 'A simple email-only login page.',
  changes: [CHANGES.brandIcons],
  gaps: [GAPS.link, GAPS.separator],
};

export function render() {
  return screen({ class: 'scr-auth', 'data-layout': 'centered' },
    el('div', { class: 'scr-auth__panel scr-stack' },
      form(stack(
        el('div', { class: 'scr-auth__brand' }, brand()),
        heading('Welcome to Acme Inc.', hint("Don't have an account?", 'Sign up')),
        emailField('login-05-email'),
        submit('Login'),
        separator('Or'),
        el('div', { class: 'scr-columns' }, secondary('Continue with Apple'), secondary('Continue with Google')),
      )),
      legal(),
    ),
  );
}
