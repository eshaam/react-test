const KEY = 'invoice_app_v1';

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { invoices: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { invoices: [] };
    if (!Array.isArray(parsed.invoices)) return { invoices: [] };
    return { invoices: parsed.invoices };
  } catch {
    return { invoices: [] };
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify({ invoices: state.invoices }));
}
