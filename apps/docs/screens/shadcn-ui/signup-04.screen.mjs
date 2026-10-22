import { ds, slot, el, screen } from '../lib/ds.mjs';
import { brand, heading, form, stack, columns, nameField, emailField, passwordField, forgotPassword, submit, secondary, separator, hint, legal, cover, GAPS, CHANGES } from '../lib/auth.mjs';

/** shadcn/ui block signup-04: A signup page with form and image. */
export const meta = {
  block: 'signup-04',
  name: 'Sign up with form and image',
  section: 'signup',
  description: 'A signup page with form and image.',
  changes: [CHANGES.brandIcons, CHANGES.cover, 'The three icon-only brand buttons become text buttons (no brand icon to show).', 'The shared hint under the two password fields is the description of the first one: a description belongs to one field.'],
  gaps: [GAPS.password, GAPS.card, GAPS.link, GAPS.separator, { text: 'A card with media: the Card has no media part, so the form and the cover share the Card root in a two-column layout.' }],
};

export function render() {
  const card = slot(
    ds.card({ title: 'Create your account', description: 'Enter your email below to create your account', headingLevel: 2 }),
    el('div', { class: 'scr-media-card' },
      form(stack(
        emailField('signup-04-email', { description: "We'll use this to contact you. We will not share your email with anyone else." }),
        columns(
          passwordField('signup-04-password', { autocomplete: 'new-password', description: 'Must be at least 8 characters long.' }),
          passwordField('signup-04-confirm-password', { label: 'Confirm Password', autocomplete: 'new-password' }),
        ),
        submit('Create Account'),
        separator('Or continue with'),
        el('div', { class: 'scr-button-row' }, secondary('Apple'), secondary('Google'), secondary('Meta')),
        hint('Already have an account?', 'Sign in'),
      )),
      el('div', { class: 'scr-media-card__media' }, cover()),
    ),
  );
  return screen({ class: 'scr-auth', 'data-layout': 'centered', 'data-surface': 'sunken' },
    el('div', { class: 'scr-auth__panel scr-auth__panel--wide scr-stack' }, card, legal()),
  );
}
