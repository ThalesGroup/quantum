/*
 * The plugin window's script (a browser iframe): follows the messages of src/plugin.js and updates
 * the components src/ui/ui.mjs rendered at build time, through their attributes only: the progress
 * bar's value, each row's status badge, the Close button. Follows Penpot's light or dark theme.
 */
const root = document.documentElement;
const progress = document.querySelector('.qf-progress .ds-progress-bar__track');
const progressLabel = document.querySelector('.qf-progress .ds-progress-bar__label');
const progressValue = document.querySelector('.qf-progress .ds-progress-bar__value');
const summary = document.getElementById('qf-summary');
const warnings = document.getElementById('qf-warnings');
const close = document.getElementById('qf-close');

/** Badge of each status: label, intent and emphasis of the design system's Badge. */
const STATUS = {
  waiting: ['Waiting', 'neutral', 'subtle'],
  running: ['Drawing', 'brand', 'accent'],
  done: ['Drawn', 'success', 'subtle'],
  kept: ['Kept', 'info', 'subtle'],
  failed: ['Failed', 'error', 'accent'],
};

/**
 * Penpot opens the window with its theme in the URL (`#/?theme=dark` for a version 2 manifest,
 * `?theme=dark` before), then posts a change; the tokens read data-theme.
 */
const setTheme = (theme) => { root.dataset.theme = theme === 'dark' ? 'dark' : 'light'; };
const { hash, search } = window.location;
setTheme(new URLSearchParams(hash.includes('?') ? hash.slice(hash.indexOf('?')) : search).get('theme'));

const row = (key) => document.querySelector(`.qf-row[data-key="${key}"]`);

function setStatus(key, status, detail, label) {
  const el = row(key);
  if (!el) return;
  el.dataset.status = status;
  const [text, intent, emphasis] = STATUS[status];
  const badge = el.querySelector('.ds-badge');
  badge.dataset.intent = intent;
  badge.dataset.emphasis = emphasis;
  badge.querySelector('.ds-badge__label').textContent = label ?? text;
  if (detail !== undefined) el.querySelector('.qf-detail').textContent = detail;
  if (status === 'running') el.scrollIntoView({ block: 'nearest' });
}

function setProgress(label, value, max) {
  progressLabel.textContent = label;
  if (value === null) {
    // Indeterminate: the native progress without a value.
    progress.removeAttribute('value');
    progressValue.hidden = true;
    return;
  }
  progress.max = max;
  progress.value = value;
  progressValue.hidden = false;
  progressValue.textContent = `${Math.round((value / max) * 100)}%`;
}

let total = 0;
let drawnBefore = 0;

window.addEventListener('message', (event) => {
  const msg = event.data;
  if (!msg || typeof msg !== 'object') return;
  if (msg.type === 'theme') {
    setTheme(msg.theme);
  } else if (msg.type === 'tokens') {
    if (msg.status === 'running') {
      setStatus('tokens', 'running', `${msg.done} / ${msg.total} tokens`, 'Writing');
      setProgress('Writing the tokens…', null);
    } else {
      setStatus('tokens', 'done', msg.detail, 'Done');
    }
  } else if (msg.type === 'component') {
    total = msg.totalVariants;
    const variants = `${msg.drawn} / ${msg.total} variants`;
    if (msg.status === 'running') {
      const combining = msg.phase === 'combining';
      setStatus(msg.id, 'running', combining ? 'combining the variants' : variants);
      setProgress(`${combining ? 'Combining' : 'Drawing'} ${msg.name}…`, drawnBefore + msg.drawn, total);
    } else {
      setStatus(msg.id, msg.status, msg.status === 'kept' ? 'already in the file' : msg.status === 'failed' ? msg.error : `${msg.total} variants`);
      drawnBefore += msg.total;
      setProgress(`${msg.name}: ${STATUS[msg.status][0].toLowerCase()}`, drawnBefore, total);
    }
  } else if (msg.type === 'finished') {
    setProgress(msg.error ? 'Stopped' : 'Done', total, total || 1);
    summary.textContent = msg.summary;
    if (msg.warnings.length) {
      warnings.hidden = false;
      warnings.querySelector('h2').textContent = `${msg.warnings.length} warning${msg.warnings.length > 1 ? 's' : ''}`;
      const list = warnings.querySelector('ul');
      for (const text of msg.warnings) {
        const li = document.createElement('li');
        li.textContent = text;
        list.append(li);
      }
    }
    close.disabled = false;
    close.focus();
  }
});

close.addEventListener('click', () => parent.postMessage({ type: 'close' }, '*'));
parent.postMessage({ type: 'ready' }, '*');
