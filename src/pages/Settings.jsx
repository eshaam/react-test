export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">Defaults and preferences (coming soon).</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-soft">
        <p className="text-sm text-slate-200">
          Next up: save your company details, VAT defaults, and invoice numbering rules.
        </p>
        <p className="mt-2 text-xs text-slate-400">For now, enter “From” details per invoice.</p>
      </div>
    </div>
  );
}
