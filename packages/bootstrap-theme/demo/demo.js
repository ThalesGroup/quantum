// Demo page behaviour: color mode switch, Quantum theme toggle, and the few
// Bootstrap 6 pieces that need JavaScript beyond the data attributes.
//
// Bootstrap 6 ships its bundle as an ES module (`export { Alert, … }`), so it
// exposes no global. This file reads the API from `window.bootstrap` when a
// build provides it, otherwise imports the bundle (same URL, so the same module
// instance as the <script type="module"> tag when the page is served unbuilt).
// Everything else (menus, dialogs, drawers, tabs, chips, OTP, strength meter,
// range, datepicker, combobox, tooltips and popovers) initialises itself from
// data attributes.

const STORAGE_KEY = 'quantum-bootstrap-demo-color-mode'
const root = document.documentElement

const storage = {
  get(key) {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      // Storage can be unavailable (private mode, blocked site data): ignore.
    }
  }
}

// Color mode ---------------------------------------------------------------

const applyColorMode = mode => {
  if (mode === 'light' || mode === 'dark') {
    root.dataset.bsTheme = mode
  } else {
    delete root.dataset.bsTheme
  }
}

const savedMode = storage.get(STORAGE_KEY) || 'auto'
applyColorMode(savedMode)

for (const radio of document.querySelectorAll('input[name="demo-color-mode"]')) {
  radio.checked = radio.value === savedMode
  radio.addEventListener('change', () => {
    if (!radio.checked) {
      return
    }

    applyColorMode(radio.value)
    storage.set(STORAGE_KEY, radio.value)
  })
}

// Quantum theme on/off -------------------------------------------------------

const themeLink = document.getElementById('quantum-theme')
const themeToggle = document.getElementById('demo-quantum-toggle')

if (themeLink && themeToggle) {
  themeToggle.checked = !themeLink.disabled
  themeToggle.addEventListener('change', () => {
    themeLink.disabled = !themeToggle.checked
  })
}

// Indeterminate checkboxes (no HTML attribute exists for this state) -----------

for (const checkbox of document.querySelectorAll('[data-demo-indeterminate]')) {
  checkbox.indeterminate = true
}

// Demo forms never navigate away --------------------------------------------

document.addEventListener('submit', event => {
  event.preventDefault()
})

// Bootstrap API --------------------------------------------------------------

const loadBootstrap = async () => {
  if (window.bootstrap) {
    return window.bootstrap
  }

  try {
    return await import('../node_modules/bootstrap/dist/js/bootstrap.bundle.js')
  } catch {
    return null
  }
}

const bootstrap = await loadBootstrap()

if (bootstrap) {
  // Tooltips and popovers also self-initialise on first hover/focus/click;
  // creating them up front makes the very first interaction behave normally.
  for (const element of document.querySelectorAll('[data-bs-toggle="tooltip"]')) {
    bootstrap.Tooltip.getOrCreateInstance(element)
  }

  for (const element of document.querySelectorAll('[data-bs-toggle="popover"]')) {
    bootstrap.Popover.getOrCreateInstance(element)
  }
}

// Live toast: uses the Toast API, or toggles the .show class without it.
const toastTrigger = document.getElementById('demo-toast-trigger')
const liveToast = document.getElementById('demo-live-toast')

if (toastTrigger && liveToast) {
  toastTrigger.addEventListener('click', () => {
    if (bootstrap) {
      bootstrap.Toast.getOrCreateInstance(liveToast).show()
      return
    }

    liveToast.classList.add('show')
    window.setTimeout(() => liveToast.classList.remove('show'), 5000)
  })
}
