import { Link, useNavigate } from 'react-router-dom';
import { calcInvoiceTotals, formatMoney } from '../lib/invoice.js';

function Pill({ status }) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset';
  const map = {
    draft: 'bg-slate-500/10 text-slate-200 ring-white/10',
    sent: 'bg-sky-500/10 text-sky-200 ring-sky-400/20',
    paid: 'bg-emerald-500/10 text-emerald-200 ring-emerald-400/20',
  };
  return <span className={`${base} ${map[status] || map.draft}`}>{status}</span>;
}

export default function Invoices({ state, actions }) {
  const nav = useNavigate();
  const invoices = state.invoices ?? [];

  function onNew() {
    const inv = actions.createInvoice();
    nav(`/invoice/${inv.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="mt-1 text-sm text-slate-400">Create, edit, and export invoices as PDF.</p>
        </div>
        <button
          className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-soft hover:opacity-95"
          onClick={onNew}
        >
          New invoice
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 shadow-soft">
        {invoices.length === 0 ? (
          <div className="p-8">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              <p className="text-sm text-slate-300">No invoices yet.</p>
              <button
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:opacity-95"
                onClick={onNew}
              >
                Create your first invoice
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/[0.03]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Number</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {invoices.map((inv) => {
                  const totals = calcInvoiceTotals(inv);
                  return (
                    <tr key={inv.id} className="hover:bg-white/[0.03]">
                      <td className="px-4 py-4">
                        <Link className="font-medium text-white hover:underline" to={`/invoice/${inv.id}`}>
                          {inv.number}
                        </Link>
                        <div className="mt-1 text-xs text-slate-400">Due {inv.dueDate}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-200">
                        {inv.to?.name || <span className="text-slate-400">(no client)</span>}
                      </td>
                      <td className="px-4 py-4">
                        <Pill status={inv.status} />
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-semibold text-slate-100">
                        {formatMoney(totals.total, inv.currency)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-white/10"
                          to={`/invoice/${inv.id}`}
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500">
        Tip: your invoices are saved in this browser only (localStorage).
      </div>
    </div>
  );
}
