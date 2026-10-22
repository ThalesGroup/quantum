import { ds, slot, el, screen } from '../lib/ds.mjs';
import { brand, heading, form, stack, columns, nameField, emailField, passwordField, forgotPassword, submit, secondary, separator, hint, legal, cover, GAPS, CHANGES } from '../lib/auth.mjs';

/** shadcn/ui block signup-02: A two column signup page with a cover image. */
export const meta = {
  block: 'signup-02',
  name: 'Two-column sign-up with a cover image',
  section: 'signup',
  description: 'A two column signup page with a cover image.',
  changes: [CHANGES.brandIcons, CHANGES.cover],
  gaps: [GAPS.password, GAPS.link, GAPS.separator],
};

export function render() {
  return screen({ class: 'scr-auth', 'data-layout': 'split' },
    el('div', { class: 'scr-auth__main' },
      el('div', { class: 'scr-auth__top' }, brand()),
      el('div', { class: 'scr-auth__center' }, el('div', { class: 'scr-auth__panel' }, form(stack(
        heading('Create your account', 'Fill in the form below to create your account'),
        nameField('signup-02-name'),
        emailField('signup-02-email', { description: "We'll use this to contact you. We will not share your email with anyone else." }),
        passwordField('signup-02-password', { description: 'Must be at least 8 characters long.', autocomplete: 'new-password' }),
        passwordField('signup-02-confirm-password', { label: 'Confirm Password', description: 'Please confirm your password.', autocomplete: 'new-password' }),
        submit('Create Account'),
        separator('Or continue with'),
        secondary('Sign up with GitHub'),
        hint('Already have an account?', 'Sign in'),
      )))),
    ),
    el('div', { class: 'scr-auth__aside' }, cover()),
  );
}
