import { ds, slot, el, screen } from '../lib/ds.mjs';
import { form, stack, submit, requiredNote, CHANGES } from '../lib/auth.mjs';

/**
 * shadcn/ui example form-rhf-complex: a subscription form (a plan, a billing period, add-ons and
 * email notifications, a Checkbox where the original has a Switch) validated with React Hook Form, shown as the browser leaves it after a
 * submit with the billing period and the add-ons left empty.
 */
export const meta = {
  block: 'form-rhf-complex',
  name: 'Subscription preferences',
  section: 'forms',
  description: 'A subscription form with a plan, a billing period, add-ons and email notifications, validated with React Hook Form.',
  changes: [
    CHANGES.heading,
    'A note before the first field says "All fields are required unless marked optional.", and Email notifications, the one optional field, ends its label with "(optional)": the Forms rule marks the fewer fields (the original marks none).',
    'Shown after a submit with nothing changed: the billing period and the add-ons, which the original leaves empty, are in error with their messages; the plan keeps its default, Basic.',
    'Messages say the fix and rely on their label: "Choose one" for the billing period and "Choose at least one" for the add-ons, where the original says "Please select a billing period" and "Please select at least one add-on".',
    'Labels and descriptions are in sentence case, and a description of one sentence takes no period ("Subscription plan", "Choose your subscription plan").',
    'The plans are a Radio group with a description under each option; the original draws each plan as a bordered card with the radio at its end.',
    'Email notifications is a Checkbox, where the original has a Switch: its value takes effect only when people press "Save preferences", and an on/off value saved by a submit button is a Checkbox, a Switch being for a setting that takes effect at once (Forms rule form-control, decision forms-on-off-saved-by-button). Its label and description follow the box, where the original puts them before the switch.',
    'The actions follow the last field inside the form, at the field gap, with Reset as a native reset button; the original puts them in the card footer under a border.',
  ],
  gaps: [
    { text: 'The Card has no content or footer part: the form, its separators and its actions are placed inside the Card root after its title and description.' },
    { text: 'No Error summary component: with two fields in error after a submit, the form would show a summary above its first field, its title taking focus.', issues: [129] },
  ],
};

const ID = 'form-rhf-complex';

export function render() {
  const card = slot(
    ds.card({ title: "You're almost there!", description: 'Choose your subscription plan and billing period', headingLevel: 2 }),
    form(stack(
      requiredNote(),
      ds.radioGroup({
        id: `${ID}-plan`,
        name: 'plan',
        label: 'Subscription plan',
        description: 'Choose your subscription plan',
        required: true,
        options: [
          { label: 'Basic', value: 'basic', description: 'For individuals and small teams', checked: true },
          { label: 'Pro', value: 'pro', description: 'For businesses with higher demands' },
        ],
      }),
      ds.divider({}),
      ds.select({
        id: `${ID}-billing-period`,
        name: 'billingPeriod',
        label: 'Billing period',
        placeholder: 'Select',
        description: 'Choose how often you want to be billed',
        required: true,
        severity: 'error',
        message: 'Choose one',
        options: [{ label: 'Monthly', value: 'monthly' }, { label: 'Yearly', value: 'yearly' }],
      }),
      ds.divider({}),
      ds.checkboxGroup({
        id: `${ID}-addons`,
        name: 'addons',
        label: 'Add-ons',
        description: "Select additional features you'd like to include",
        required: true,
        severity: 'error',
        message: 'Choose at least one',
        options: [
          { label: 'Analytics', value: 'analytics', description: 'Advanced analytics and reporting' },
          { label: 'Backup', value: 'backup', description: 'Automated daily backups' },
          { label: 'Priority support', value: 'support', description: '24/7 premium customer support' },
        ],
      }),
      ds.divider({}),
      ds.checkbox({
        id: `${ID}-email-notifications`,
        name: 'emailNotifications',
        label: 'Email notifications',
        description: 'Receive email updates about your subscription',
      }),
      submit('Save preferences'),
      ds.button({ label: 'Reset', emphasis: 'subtle', type: 'reset' }),
    )),
  );
  return screen({ class: 'scr-auth', 'data-layout': 'centered' }, el('div', { class: 'scr-auth__panel' }, card));
}
