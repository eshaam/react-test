// Basic invoice model helpers
// Stored shape is intentionally simple and versionable.

export const INVOICE_SCHEMA_VERSION = 1;

export function newInvoice(partial = {}) {
  const now = new Date();
  const iso = now.toISOString();
  return {
    schemaVersion: INVOICE_SCHEMA_VERSION,
    id: partial.id ?? crypto.randomUUID(),
    number: partial.number ?? `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`,
    status: partial.status ?? 'draft', // draft|sent|paid
    createdAt: partial.createdAt ?? iso,
    updatedAt: partial.updatedAt ?? iso,

    from: {
      name: partial.from?.name ?? '',
      email: partial.from?.email ?? '',
      address: partial.from?.address ?? '',
    },
    to: {
      name: partial.to?.name ?? '',
      email: partial.to?.email ?? '',
      address: partial.to?.address ?? '',
    },

    issueDate: partial.issueDate ?? iso.slice(0, 10),
    dueDate: partial.dueDate ?? iso.slice(0, 10),
    currency: partial.currency ?? 'ZAR',

    items: Array.isArray(partial.items) && partial.items.length
      ? partial.items
      : [newLineItem()],

    notes: partial.notes ?? '',
    taxRate: partial.taxRate ?? 0, // percent, e.g. 15 for VAT
    discount: partial.discount ?? 0, // absolute discount in currency units
  };
}

export function newLineItem(partial = {}) {
  return {
    id: partial.id ?? crypto.randomUUID(),
    description: partial.description ?? '',
    quantity: Number.isFinite(partial.quantity) ? partial.quantity : 1,
    unitPrice: Number.isFinite(partial.unitPrice) ? partial.unitPrice : 0,
  };
}

export function calcInvoiceTotals(invoice) {
  const subtotal = (invoice.items ?? []).reduce((acc, it) => {
    const qty = Number(it.quantity) || 0;
    const unit = Number(it.unitPrice) || 0;
    return acc + qty * unit;
  }, 0);

  const discount = Number(invoice.discount) || 0;
  const discounted = Math.max(0, subtotal - discount);

  const taxRate = Number(invoice.taxRate) || 0;
  const tax = discounted * (taxRate / 100);

  const total = discounted + tax;

  return {
    subtotal,
    discount,
    taxRate,
    tax,
    total,
  };
}

export function formatMoney(amount, currency = 'ZAR') {
  const n = Number(amount) || 0;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}
