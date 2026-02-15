import { useEffect, useMemo, useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Invoices from './pages/Invoices.jsx';
import InvoiceEditor from './pages/InvoiceEditor.jsx';
import Settings from './pages/Settings.jsx';

import { createActions, initStore, persistOnChange } from './lib/store.js';
import './app.css';

export default function App() {
  const [state, setState] = useState(() => initStore());
  const actions = useMemo(() => createActions((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return next;
    });
  }, () => state), [state]);

  useEffect(() => {
    persistOnChange(state);
  }, [state]);

  const router = useMemo(() => createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <Invoices state={state} actions={actions} /> },
        { path: 'invoice/:id', element: <InvoiceEditor state={state} actions={actions} /> },
        { path: 'settings', element: <Settings /> },
      ],
    },
  ]), [actions, state]);

  return <RouterProvider router={router} />;
}
