import { useEffect, useState } from 'react';
import { LiveboardEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { LayoutGrid, ArrowLeft, RefreshCw, AlertCircle, Clock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  searchLiveboards,
  tsCustomizations,
  LiveboardSummary,
} from '../lib/thoughtspot';
import { LIVEBOARD_EMBED_FLAGS } from '../config';

const Liveboard = LiveboardEmbed as unknown as (props: any) => JSX.Element;

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; items: LiveboardSummary[] };

function formatDate(ms: number): string {
  if (!ms) return '—';
  return new Date(ms).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function MyAnalytics() {
  const { username, password } = useAuth();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [selected, setSelected] = useState<LiveboardSummary | null>(null);

  async function load() {
    setState({ status: 'loading' });
    try {
      const items = await searchLiveboards(username, password);
      setState({ status: 'ready', items });
    } catch (e) {
      setState({
        status: 'error',
        message:
          e instanceof Error
            ? e.message
            : 'Unable to reach the ThoughtSpot REST API.',
      });
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (selected) {
    return (
      <div className="tab-my-analytics">
        <div className="my-analytics-toolbar">
          <button className="back-btn" onClick={() => setSelected(null)}>
            <ArrowLeft size={16} />
            Back to My Analytics
          </button>
          <h1 className="page-title-inline">{selected.name}</h1>
        </div>
        <div className="liveboard-wrapper">
          <Liveboard
            liveboardId={selected.id}
            fullHeight
            isLiveboardMasterpiecesEnabled
            customizations={tsCustomizations(false)}
            {...LIVEBOARD_EMBED_FLAGS}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="tab-my-analytics">
      <div className="my-analytics-header">
        <div>
          <h1 className="page-title">My Analytics</h1>
          <p className="page-subtitle">
            {state.status === 'ready'
              ? `${state.items.length} liveboard${
                  state.items.length === 1 ? '' : 's'
                } you have access to`
              : 'Liveboards you have access to in ThoughtSpot'}
          </p>
        </div>
        <button className="refresh-btn" onClick={load} title="Refresh">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {state.status === 'loading' && (
        <div className="ma-state">
          <div className="ma-spinner" />
          <p>Loading your liveboards…</p>
        </div>
      )}

      {state.status === 'error' && (
        <div className="ma-state ma-error">
          <AlertCircle size={32} />
          <p className="ma-error-title">Couldn't load your liveboards</p>
          <p className="ma-error-msg">{state.message}</p>
          <p className="ma-error-hint">
            Make sure you're signed in and that this origin is allow-listed for
            CORS on the ThoughtSpot cluster.
          </p>
          <button className="refresh-btn" onClick={load}>
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      )}

      {state.status === 'ready' && state.items.length === 0 && (
        <div className="ma-state">
          <LayoutGrid size={32} />
          <p className="ma-error-title">No liveboards yet</p>
          <p className="ma-error-msg">
            You haven't authored any liveboards on this cluster.
          </p>
        </div>
      )}

      {state.status === 'ready' && state.items.length > 0 && (
        <div className="ma-grid">
          {state.items.map((lb) => (
            <button
              key={lb.id}
              className="ma-card"
              onClick={() => setSelected(lb)}
            >
              <div className="ma-card-icon">
                <LayoutGrid size={20} />
              </div>
              <h3 className="ma-card-title">{lb.name}</h3>
              {lb.description && (
                <p className="ma-card-desc">{lb.description}</p>
              )}
              <div className="ma-card-meta">
                <span className="ma-card-meta-item">
                  <Clock size={13} /> {formatDate(lb.modified)}
                </span>
                {lb.authorDisplayName && (
                  <span className="ma-card-meta-item">
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
