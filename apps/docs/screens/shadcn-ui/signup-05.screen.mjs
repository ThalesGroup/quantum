import { ds, slot, el, screen } from '../lib/ds.mjs';
import { brand, heading, form, stack, columns, nameField, emailField, passwordField, forgotPassword, submit, secondary, separator, hint, legal, cover, GAPS, CHANGES } from '../lib/auth.mjs';

/** shadcn/ui block signup-05: A simple signup form with social providers. */
export const meta = {
  block: 'signup-05',
  name: 'Sign up with social providers',
  section: 'signup',
  description: 'A simple signup form with social providers.',
  changes: [CHANGES.brandIcons],
  gaps: [GAPS.link, GAPS.separator],
};

export function render() {
  return screen({ class: 'scr-auth', 'data-layout': 'centered' },
    el('div', { class: 'scr-auth__panel scr-stack' },
      form(stack(
        el('div', { class: 'scr-auth__brand' }, brand()),
        heading('Welcome to Acme Inc.', hint('Already have an account?', 'Sign in')),
        emailField('signup-05-email'),
        submit('Create Account'),
        separator('Or'),
        el('div', { class: 'scr-columns' }, secondary('Continue with Apple'), secondary('Continue with Google')),
      )),
      legal(),
    ),
  );
}
