import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { calcInvoiceTotals, formatMoney, newLineItem } from '../lib/invoice.js';

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 shadow-soft ${className}`}>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-slate-400">{label}</div>
      {children}
    </label>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/10 ${props.className || ''}`}
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/10 ${props.className || ''}`}
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/10 ${props.className || ''}`}
    />
  );
}

function Button({ variant = 'ghost', children, ...props }) {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition';
  const styles = {
    primary: 'bg-white text-slate-900 hover:opacity-95 shadow-soft',
    ghost: 'border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10',
    danger: 'border border-red-400/20 bg-red-500/10 text-red-100 hover:bg-red-500/20',
  };
  return (
    <button className={`${base} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
}

export default function InvoiceEditor({ state, actions }) {
  const { id } = useParams();
  const nav = useNavigate();

  const existing = useMemo(() => actions.getInvoice(id), [actions, id]);
  const [invoice, setInvoice] = useState(() => existing);

  if (!invoice) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Invoice not found</h1>
          <Button onClick={() => nav('/')}>Back</Button>
        </div>
      </div>
    );
  }

  const totals = calcInvoiceTotals(invoice);

  function update(patch) {
    setInvoice((inv) => ({ ...inv, ...patch }));
  }

  function updateNested(key, patch) {
    setInvoice((inv) => ({ ...inv, [key]: { ...(inv[key] ?? {}), ...patch } }));
  }

  function updateItem(itemId, patch) {
    setInvoice((inv) => ({
      ...inv,
      items: (inv.items ?? []).map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
    }));
  }

  function addItem() {
    setInvoice((inv) => ({ ...inv, items: [...(inv.items ?? []), newLineItem()] }));
  }

  function removeItem(itemId) {
    setInvoice((inv) => ({ ...inv, items: (inv.items ?? []).filter((it) => it.id !== itemId) }));
  }

  function onSave() {
    actions.upsertInvoice(invoice);
    nav('/');
  }

  function onDelete() {
    const ok = confirm('Delete this invoice?');
    if (!ok) return;
    actions.deleteInvoice(invoice.id);
    nav('/');
  }

  function onPrint() {
    actions.upsertInvoice(invoice);
    window.print();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-medium text-slate-400">Invoice</div>
          <h1 className="text-2xl font-semibold tracking-tight">{invoice.number}</h1>
          <div className="mt-1 text-sm text-slate-400">Edit details, line items, and export to PDF.</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onPrint}>Print / Save PDF</Button>
          <Button variant="danger" onClick={onDelete}>Delete</Button>
          <Button variant="primary" onClick={onSave}>Save</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Parties</h2>
            <span className="text-xs text-slate-400">From / To</span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-300">From</div>
              <Field label="Name"><Input value={invoice.from?.name ?? ''} onChange={(e) => updateNested('from', { name: e.target.value })} /></Field>
              <Field label="Email"><Input value={invoice.from?.email ?? ''} onChange={(e) => updateNested('from', { email: e.target.value })} /></Field>
              <Field label="Address"><Textarea rows={3} value={invoice.from?.address ?? ''} onChange={(e) => updateNested('from', { address: e.target.value })} /></Field>
            </div>
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-300">To</div>
              <Field label="Client name"><Input value={invoice.to?.name ?? ''} onChange={(e) => updateNested('to', { name: e.target.value })} /></Field>
              <Field label="Client email"><Input value={invoice.to?.email ?? ''} onChange={(e) => updateNested('to', { email: e.target.value })} /></Field>
              <Field label="Client address"><Textarea rows={3} value={invoice.to?.address ?? ''} onChange={(e) => updateNested('to', { address: e.target.value })} /></Field>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Details</h2>
            <span className="text-xs text-slate-400">Status, dates, currency</span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Invoice number"><Input value={invoice.number} onChange={(e) => update({ number: e.target.value })} /></Field>
            <Field label="Status">
              <Select value={invoice.status} onChange={(e) => update({ status: e.target.value })}>
                <option value="draft">draft</option>
                <option value="sent">sent</option>
                <option value="paid">paid</option>
              </Select>
            </Field>
            <Field label="Issue date"><Input type="date" value={invoice.issueDate} onChange={(e) => update({ issueDate: e.target.value })} /></Field>
            <Field label="Due date"><Input type="date" value={invoice.dueDate} onChange={(e) => update({ dueDate: e.target.value })} /></Field>
            <Field label="Currency"><Input value={invoice.currency} onChange={(e) => update({ currency: e.target.value.toUpperCase() })} /></Field>
            <Field label="Tax rate (%)"><Input type="number" step="0.01" value={invoice.taxRate} onChange={(e) => update({ taxRate: Number(e.target.value) })} /></Field>
            <Field label="Discount"><Input type="number" step="0.01" value={invoice.discount} onChange={(e) => update({ discount: Number(e.target.value) })} /></Field>
          </div>

          <div className="mt-4">
            <Field label="Notes"><Textarea rows={4} value={invoice.notes ?? ''} onChange={(e) => update({ notes: e.target.value })} /></Field>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Line items</h2>
            <p className="mt-1 text-xs text-slate-400">Add services or products, then export to PDF.</p>
          </div>
          <Button onClick={addItem}>Add item</Button>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/[0.03]">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Description</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">Qty</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">Unit</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">Amount</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {(invoice.items ?? []).map((it) => {
                const qty = Number(it.quantity) || 0;
                const unit = Number(it.unitPrice) || 0;
                const amt = qty * unit;
                return (
                  <tr key={it.id} className="hover:bg-white/[0.03]">
                    <td className="px-3 py-3">
                      <Input
                        value={it.description}
                        onChange={(e) => updateItem(it.id, { description: e.target.value })}
                        placeholder="e.g. Website design"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <Input
                        type="number"
                        step="1"
                        className="text-right"
                        value={it.quantity}
                        onChange={(e) => updateItem(it.id, { quantity: Number(e.target.value) })}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <Input
                        type="number"
                        step="0.01"
                        className="text-right"
                        value={it.unitPrice}
                        onChange={(e) => updateItem(it.id, { unitPrice: Number(e.target.value) })}
                      />
                    </td>
                    <td className="px-3 py-3 text-right text-sm font-semibold text-slate-100">
                      {formatMoney(amt, invoice.currency)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Button variant="ghost" onClick={() => removeItem(it.id)}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col items-end gap-2">
          <div className="w-full max-w-sm space-y-2 rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Subtotal</span>
              <span>{formatMoney(totals.subtotal, invoice.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Discount</span>
              <span>- {formatMoney(totals.discount, invoice.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Tax ({totals.taxRate}%)</span>
              <span>{formatMoney(totals.tax, invoice.currency)}</span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex items-center justify-between text-base font-semibold text-white">
              <span>Total</span>
              <span>{formatMoney(totals.total, invoice.currency)}</span>
            </div>
          </div>

          <div className="text-xs text-slate-500">Tip: Save before printing so totals persist.</div>
        </div>
      </Card>
    </div>
  );
}
