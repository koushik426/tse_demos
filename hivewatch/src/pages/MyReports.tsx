// My Reports — lists liveboards the user can access via REST metadata/search,
// then opens a selected one full-width.
// REST API v2: https://developers.thoughtspot.com/docs/rest-apiv2-reference
import { useEffect, useState } from 'react';
import { LiveboardEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { LayoutGrid, ArrowLeft, RefreshCw, AlertCircle, Clock, User, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { searchLiveboards, tsCustomizations, LiveboardSummary } from '../lib/thoughtspot';
import { LIVEBOARD_EMBED_FLAGS } from '../config';

const Liveboard = LiveboardEmbed as any;

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; items: LiveboardSummary[] };

function formatDate(ms: number): string {
  if (!ms) return '—';
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyReports() {
  const { username, password } = useAuth();
  const { theme } = useTheme();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [selected, setSelected] = useState<LiveboardSummary | null>(null);
  const [query, setQuery] = useState('');

  async function load() {
    setState({ status: 'loading' });
    try {
      const items = await searchLiveboards(username, password);
      setState({ status: 'ready', items });
    } catch (e) {
      setState({
        status: 'error',
        message: e instanceof Error ? e.message : 'Unable to reach the ThoughtSpot REST API.',
      });
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (selected) {
    return (
      <div className="hw-reports-selected">
        <div className="hw-reports-toolbar">
          <button className="hw-back-btn" onClick={() => setSelected(null)}>
            <ArrowLeft size={16} /> Back to My Reports
          </button>
          <h2 className="hw-reports-selected-title">{selected.name}</h2>
        </div>
        <div className="hw-liveboard-wrapper">
          <Liveboard
            key={theme}
            liveboardId={selected.id}
            {...LIVEBOARD_EMBED_FLAGS}
            frameParams={{ width: '100%' }}
            customizations={tsCustomizations(theme)}
          />
        </div>
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const filtered =
    state.status === 'ready'
      ? state.items.filter(
          (lb) =>
            !q ||
            lb.name.toLowerCase().includes(q) ||
            lb.description.toLowerCase().includes(q) ||
            lb.authorDisplayName.toLowerCase().includes(q),
        )
      : [];

  return (
    <div className="hw-reports">
      <div className="hw-reports-head">
        <div>
          <h2 className="hw-reports-title">My Reports</h2>
          <p className="hw-reports-subtitle">
            {state.status === 'ready'
              ? q
                ? `${filtered.length} of ${state.items.length} liveboard${state.items.length === 1 ? '' : 's'}`
                : `${state.items.length} liveboard${state.items.length === 1 ? '' : 's'} you have access to`
              : 'Liveboards created by or shared with you'}
          </p>
        </div>
        <div className="hw-reports-head-actions">
          <div className="hw-reports-search">
            <Search size={16} className="hw-reports-search-icon" />
            <input
              type="text"
              placeholder="Search reports…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className="hw-reports-search-clear" onClick={() => setQuery('')} aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>
          <button className="hw-refresh-btn" onClick={load} title="Refresh">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {state.status === 'loading' && (
        <div className="hw-reports-state">
          <span className="hw-spinner" />
          <p>Loading your liveboards…</p>
        </div>
      )}

      {state.status === 'error' && (
        <div className="hw-reports-state hw-reports-error">
          <AlertCircle size={32} />
          <p className="hw-reports-state-title">Couldn't load your liveboards</p>
          <p className="hw-reports-state-msg">{state.message}</p>
          <p className="hw-reports-state-hint">
            Make sure you're signed in and that this origin is allow-listed for CORS on the
            ThoughtSpot cluster.
          </p>
          <button className="hw-refresh-btn" onClick={load}>
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      )}

      {state.status === 'ready' && state.items.length === 0 && (
        <div className="hw-reports-state">
          <LayoutGrid size={32} />
          <p className="hw-reports-state-title">No liveboards yet</p>
          <p className="hw-reports-state-msg">You don't have access to any liveboards on this cluster.</p>
        </div>
      )}

      {state.status === 'ready' && state.items.length > 0 && filtered.length === 0 && (
        <div className="hw-reports-state">
          <Search size={32} />
          <p className="hw-reports-state-title">No matches</p>
          <p className="hw-reports-state-msg">No reports match “{query}”. Try a different search.</p>
        </div>
      )}

      {state.status === 'ready' && filtered.length > 0 && (
        <div className="hw-reports-grid">
          {filtered.map((lb) => (
            <button key={lb.id} className="hw-report-card" onClick={() => setSelected(lb)}>
              <div className="hw-report-card-icon">
                <LayoutGrid size={20} />
              </div>
              <h3 className="hw-report-card-title">{lb.name}</h3>
              {lb.description && <p className="hw-report-card-desc">{lb.description}</p>}
              <div className="hw-report-card-meta">
                <span className="hw-report-card-meta-item">
                  <Clock size={13} /> {formatDate(lb.modified)}
                </span>
                {lb.authorDisplayName && (
                  <span className="hw-report-card-meta-item">
                    <User size={13} /> {lb.authorDisplayName}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
