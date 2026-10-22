import { ds, slot, el, screen } from '../lib/ds.mjs';
import { brand, heading, form, stack, columns, nameField, emailField, passwordField, forgotPassword, submit, secondary, separator, hint, legal, cover, GAPS, CHANGES } from '../lib/auth.mjs';

/** shadcn/ui block signup-01: A simple signup form. */
export const meta = {
  block: 'signup-01',
  name: 'Sign-up form in a card',
  section: 'signup',
  description: 'A simple signup form.',
  changes: [CHANGES.heading],
  gaps: [GAPS.password, GAPS.card, GAPS.link],
};

export function render() {
  const card = slot(
    ds.card({ title: 'Create an account', description: 'Enter your information below to create your account', headingLevel: 2 }),
    form(stack(
      nameField('signup-01-name'),
      emailField('signup-01-email', { description: "We'll use this to contact you. We will not share your email with anyone else." }),
      passwordField('signup-01-password', { description: 'Must be at least 8 characters long.', autocomplete: 'new-password' }),
      passwordField('signup-01-confirm-password', { label: 'Confirm Password', description: 'Please confirm your password.', autocomplete: 'new-password' }),
      submit('Create Account'),
      secondary('Sign up with Google'),
      hint('Already have an account?', 'Sign in'),
    )),
  );
  return screen({ class: 'scr-auth', 'data-layout': 'centered' }, el('div', { class: 'scr-auth__panel' }, card));
}
