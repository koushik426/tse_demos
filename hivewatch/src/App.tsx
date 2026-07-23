import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Sidebar, { NavId, NAV_ITEMS } from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import MyReports from './pages/MyReports';
import AskAI from './pages/AskAI';
import CreateBoard from './pages/CreateBoard';
import { createEmptyLiveboard } from './lib/thoughtspot';

export default function App() {
  const { isAuthenticated, username, password } = useAuth();
  const [nav, setNav] = useState<NavId>('dashboard');
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  if (!isAuthenticated) return <Login />;

  async function handleCreate() {
    if (creating) return;
    setCreating(true);
    try {
      const id = await createEmptyLiveboard(username, password);
      setCreatedId(id);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not create dashboard.');
    } finally {
      setCreating(false);
    }
  }

  const title = createdId
    ? 'New Dashboard'
    : NAV_ITEMS.find((n) => n.id === nav)?.label ?? 'HiveWatch';

  return (
    <div className="hw-app">
      <Sidebar
        active={nav}
        onChange={(id) => {
          setCreatedId(null);
          setNav(id);
        }}
      />
      <div className="hw-main">
        <TopBar title={title} onCreate={handleCreate} creating={creating} />
        <main className="hw-content">
          {createdId ? (
            <CreateBoard liveboardId={createdId} onBack={() => setCreatedId(null)} />
          ) : (
            <>
              {nav === 'dashboard' && <Dashboard />}
              {nav === 'reports' && <MyReports />}
              {nav === 'ask' && <AskAI />}
              {nav !== 'dashboard' && nav !== 'reports' && nav !== 'ask' && (
                <div className="hw-placeholder">
                  <h2>{title}</h2>
                  <p>
                    This is a demo shell. Open <strong>Dashboard</strong>,{' '}
                    <strong>My Reports</strong>, or <strong>Ask HiveWatch AI</strong> to use the
                    ThoughtSpot analytics.
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
