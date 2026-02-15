import { Link, useNavigate } from 'react-router-dom';
import { formatMoney, calcInvoiceTotals } from '../lib/invoice.js';

export default function Invoices({ state, actions }) {
  const nav = useNavigate();

  function onNew() {
    const inv = actions.createInvoice();
    nav(`/invoice/${inv.id}`);
  }

  const invoices = state.invoices ?? [];

  return (
    <div className="page">
      <div className="row space">
        <h1>Invoices</h1>
        <button className="primary" onClick={onNew}>New invoice</button>
      </div>

      {invoices.length === 0 ? (
        <div className="card">
          <p>No invoices yet.</p>
          <button className="primary" onClick={onNew}>Create your first invoice</button>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Client</th>
                <th>Status</th>
                <th className="right">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const totals = calcInvoiceTotals(inv);
                return (
                  <tr key={inv.id}>
                    <td>
                      <Link to={`/invoice/${inv.id}`}>{inv.number}</Link>
                      <div className="muted tiny">Due {inv.dueDate}</div>
                    </td>
                    <td>{inv.to?.name || <span className="muted">(no client)</span>}</td>
                    <td><span className={`badge ${inv.status}`}>{inv.status}</span></td>
                    <td className="right">{formatMoney(totals.total, inv.currency)}</td>
                    <td className="right">
                      <Link className="btn" to={`/invoice/${inv.id}`}>Edit</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
