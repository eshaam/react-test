import { useEffect, useState } from 'react';

// Minimal placeholder settings page.
// Next step: persist default 'from' details + VAT defaults.

export default function Settings() {
  const [note, setNote] = useState('');

  useEffect(() => {
    setNote('Coming soon: defaults for your company details, VAT, and invoice numbering.');
  }, []);

  return (
    <div className="page">
      <h1>Settings</h1>
      <div className="card">
        <p>{note}</p>
        <p className="muted tiny">For now, enter “From” details per invoice.</p>
      </div>
    </div>
  );
}
