import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { calcInvoiceTotals, formatMoney, newLineItem } from '../lib/invoice.js';

function Field({ label, children }) {
  return (
    <label className="field">
      <div className="label">{label}</div>
      {children}
    </label>
  );
}

export default function InvoiceEditor({ state, actions }) {
  const { id } = useParams();
  const nav = useNavigate();

  const existing = useMemo(() => actions.getInvoice(id), [actions, id]);
  const [invoice, setInvoice] = useState(() => existing);

  if (!invoice) {
    return (
      <div className="page">
        <div className="row space">
          <h1>Invoice not found</h1>
          <button className="btn" onClick={() => nav('/')}>Back</button>
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
    <div className="page">
      <div className="row space">
        <h1>{invoice.number}</h1>
        <div className="row gap">
          <button className="btn" onClick={onPrint}>Print / Save PDF</button>
          <button className="btn" onClick={onDelete}>Delete</button>
          <button className="primary" onClick={onSave}>Save</button>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <h2>Parties</h2>
          <div className="grid2">
            <div>
              <h3 className="h3">From</h3>
              <Field label="Name"><input value={invoice.from?.name ?? ''} onChange={(e) => updateNested('from', { name: e.target.value })} /></Field>
              <Field label="Email"><input value={invoice.from?.email ?? ''} onChange={(e) => updateNested('from', { email: e.target.value })} /></Field>
              <Field label="Address"><textarea rows={3} value={invoice.from?.address ?? ''} onChange={(e) => updateNested('from', { address: e.target.value })} /></Field>
            </div>
            <div>
              <h3 className="h3">To</h3>
              <Field label="Client name"><input value={invoice.to?.name ?? ''} onChange={(e) => updateNested('to', { name: e.target.value })} /></Field>
              <Field label="Client email"><input value={invoice.to?.email ?? ''} onChange={(e) => updateNested('to', { email: e.target.value })} /></Field>
              <Field label="Client address"><textarea rows={3} value={invoice.to?.address ?? ''} onChange={(e) => updateNested('to', { address: e.target.value })} /></Field>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Details</h2>
          <div className="grid2">
            <Field label="Invoice number"><input value={invoice.number} onChange={(e) => update({ number: e.target.value })} /></Field>
            <Field label="Status">
              <select value={invoice.status} onChange={(e) => update({ status: e.target.value })}>
                <option value="draft">draft</option>
                <option value="sent">sent</option>
                <option value="paid">paid</option>
              </select>
            </Field>
            <Field label="Issue date"><input type="date" value={invoice.issueDate} onChange={(e) => update({ issueDate: e.target.value })} /></Field>
            <Field label="Due date"><input type="date" value={invoice.dueDate} onChange={(e) => update({ dueDate: e.target.value })} /></Field>
            <Field label="Currency"><input value={invoice.currency} onChange={(e) => update({ currency: e.target.value.toUpperCase() })} /></Field>
            <Field label="Tax rate (%)"><input type="number" step="0.01" value={invoice.taxRate} onChange={(e) => update({ taxRate: Number(e.target.value) })} /></Field>
            <Field label="Discount"><input type="number" step="0.01" value={invoice.discount} onChange={(e) => update({ discount: Number(e.target.value) })} /></Field>
          </div>
          <Field label="Notes"><textarea rows={4} value={invoice.notes ?? ''} onChange={(e) => update({ notes: e.target.value })} /></Field>
        </div>
      </div>

      <div className="card">
        <div className="row space">
          <h2>Line items</h2>
          <button className="btn" onClick={addItem}>Add item</button>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="right">Qty</th>
                <th className="right">Unit</th>
                <th className="right">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(invoice.items ?? []).map((it) => {
                const qty = Number(it.quantity) || 0;
                const unit = Number(it.unitPrice) || 0;
                const amt = qty * unit;
                return (
                  <tr key={it.id}>
                    <td>
                      <input
                        value={it.description}
                        onChange={(e) => updateItem(it.id, { description: e.target.value })}
                        placeholder="e.g. Website design"
                      />
                    </td>
                    <td className="right">
                      <input
                        type="number"
                        step="1"
                        value={it.quantity}
                        onChange={(e) => updateItem(it.id, { quantity: Number(e.target.value) })}
                      />
                    </td>
                    <td className="right">
                      <input
                        type="number"
                        step="0.01"
                        value={it.unitPrice}
                        onChange={(e) => updateItem(it.id, { unitPrice: Number(e.target.value) })}
                      />
                    </td>
                    <td className="right">{formatMoney(amt, invoice.currency)}</td>
                    <td className="right">
                      <button className="btn" onClick={() => removeItem(it.id)}>Remove</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="totals">
          <div className="totals-row"><span className="muted">Subtotal</span><span>{formatMoney(totals.subtotal, invoice.currency)}</span></div>
          <div className="totals-row"><span className="muted">Discount</span><span>- {formatMoney(totals.discount, invoice.currency)}</span></div>
          <div className="totals-row"><span className="muted">Tax ({totals.taxRate}%)</span><span>{formatMoney(totals.tax, invoice.currency)}</span></div>
          <div className="totals-row grand"><span>Total</span><span>{formatMoney(totals.total, invoice.currency)}</span></div>
        </div>
      </div>

      <div className="print-hint muted tiny">
        Tip: use “Print / Save PDF” to export the invoice.
      </div>
    </div>
  );
}
