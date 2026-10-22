import { ds, slot, el, screen } from '../lib/ds.mjs';
import { brand, heading, form, stack, columns, nameField, emailField, passwordField, forgotPassword, submit, secondary, separator, hint, legal, cover, GAPS, CHANGES } from '../lib/auth.mjs';

/** shadcn/ui block signup-03: A signup page with a muted background color. */
export const meta = {
  block: 'signup-03',
  name: 'Sign up with a muted background',
  section: 'signup',
  description: 'A signup page with a muted background color.',
  changes: [CHANGES.heading, 'The shared hint under the two password fields is the description of the confirmation field: a description belongs to one field.'],
  gaps: [GAPS.password, GAPS.card, GAPS.link],
};

export function render() {
  const card = slot(
    ds.card({ title: 'Create your account', description: 'Enter your email below to create your account', headingLevel: 2 }),
    form(stack(
      nameField('signup-03-name'),
      emailField('signup-03-email'),
      columns(
        passwordField('signup-03-password', { autocomplete: 'new-password', description: 'Must be at least 8 characters long.' }),
        passwordField('signup-03-confirm-password', { label: 'Confirm Password', autocomplete: 'new-password' }),
      ),
      submit('Create Account'),
      hint('Already have an account?', 'Sign in'),
    )),
  );
  return screen({ class: 'scr-auth', 'data-layout': 'centered', 'data-surface': 'sunken' },
    el('div', { class: 'scr-auth__panel scr-stack' }, el('div', { class: 'scr-auth__brand' }, brand()), card, legal()),
  );
}
