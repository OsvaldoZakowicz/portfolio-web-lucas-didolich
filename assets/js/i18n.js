let translations = null;

function resolveKey(key) {
  if (!translations) return null;

  const keys = key.split('.');
  let value = translations;

  for (const k of keys) {
    if (value == null || typeof value !== 'object' || !(k in value)) {
      return null;
    }
    value = value[k];
  }

  return typeof value === 'string' ? value : null;
}

export async function init() {
  try {
    const response = await fetch('/locales/es.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    translations = await response.json();

    document.documentElement.lang = 'es';

    const title = resolveKey('meta.title');
    if (title) document.title = title;

    const description = resolveKey('meta.description');
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.content = description;
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const value = resolveKey(key);
      if (value !== null) {
        el.textContent = value;
      } else {
        console.error(`i18n: missing key "${key}" for [data-i18n]`);
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (!key) return;
      const value = resolveKey(key);
      if (value !== null) {
        el.placeholder = value;
      } else {
        console.error(`i18n: missing key "${key}" for [data-i18n-placeholder]`);
      }
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria-label');
      if (!key) return;
      const value = resolveKey(key);
      if (value !== null) {
        el.setAttribute('aria-label', value);
      } else {
        console.error(`i18n: missing key "${key}" for [data-i18n-aria-label]`);
      }
    });
  } catch (err) {
    console.error('i18n: initialization failed', err);
  }
}

export function t(key) {
  const value = resolveKey(key);
  if (value === null) {
    console.error(`i18n: missing translation key "${key}"`);
    return key;
  }
  return value;
}

export function getLocale() {
  return 'es';
}
