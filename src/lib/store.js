import { loadState, saveState } from './storage.js';
import { newInvoice } from './invoice.js';

// Tiny store using React state + localStorage persistence.

export function initStore() {
  const loaded = loadState();
  return {
    invoices: loaded.invoices ?? [],
  };
}

export function createActions(setState, getState) {
  return {
    createInvoice() {
      const inv = newInvoice();
      setState((s) => ({ ...s, invoices: [inv, ...(s.invoices ?? [])] }));
      return inv;
    },

    upsertInvoice(invoice) {
      const nowIso = new Date().toISOString();
      const next = { ...invoice, updatedAt: nowIso };
      setState((s) => {
        const list = s.invoices ?? [];
        const idx = list.findIndex((x) => x.id === next.id);
        const invoices = idx === -1
          ? [next, ...list]
          : list.map((x) => (x.id === next.id ? next : x));
        return { ...s, invoices };
      });
    },

    deleteInvoice(id) {
      setState((s) => ({ ...s, invoices: (s.invoices ?? []).filter((x) => x.id !== id) }));
    },

    getInvoice(id) {
      return (getState().invoices ?? []).find((x) => x.id === id) ?? null;
    },
  };
}

export function persistOnChange(state) {
  saveState(state);
}
