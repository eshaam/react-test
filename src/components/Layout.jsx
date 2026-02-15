import { NavLink, Outlet } from 'react-router-dom';

function NavItem({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'text-sm font-medium px-3 py-2 rounded-lg transition',
          isActive
            ? 'bg-white/10 text-white'
            : 'text-slate-300 hover:text-white hover:bg-white/5',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen">
      {/* top glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-220px] h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600/35 via-fuchsia-600/20 to-cyan-500/20 blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-soft" />
            <div>
              <div className="text-sm font-semibold">Invoice Desk</div>
              <div className="text-xs text-slate-400">Local-first invoicing</div>
            </div>
          </div>

          <nav className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            <NavItem to="/" end>
              Invoices
            </NavItem>
            <NavItem to="/settings">Settings</NavItem>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 text-xs text-slate-400">
          <span>Built with Vite + React • Hosted on Vercel</span>
          <span>Data stored in your browser</span>
        </div>
      </footer>
    </div>
  );
}
