import { ds, slot, el, screen } from '../lib/ds.mjs';
import { brand, heading, form, stack, columns, nameField, emailField, passwordField, forgotPassword, submit, secondary, separator, hint, legal, cover, GAPS, CHANGES } from '../lib/auth.mjs';

/** shadcn/ui block login-02: A two column login page with a cover image. */
export const meta = {
  block: 'login-02',
  name: 'Two-column login with a cover image',
  section: 'login',
  description: 'A two column login page with a cover image.',
  changes: [CHANGES.forgot, CHANGES.brandIcons, CHANGES.cover],
  gaps: [GAPS.password, GAPS.link, GAPS.separator],
};

export function render() {
  return screen({ class: 'scr-auth', 'data-layout': 'split' },
    el('div', { class: 'scr-auth__main' },
      el('div', { class: 'scr-auth__top' }, brand()),
      el('div', { class: 'scr-auth__center' }, el('div', { class: 'scr-auth__panel' }, form(stack(
        heading('Login to your account', 'Enter your email below to login to your account'),
        emailField('login-02-email'),
        passwordField('login-02-password'),
        forgotPassword(),
        submit('Login'),
        separator('Or continue with'),
        secondary('Login with GitHub'),
        hint("Don't have an account?", 'Sign up'),
      )))),
    ),
    el('div', { class: 'scr-auth__aside' }, cover()),
  );
}
