import { useEffect, useState } from 'react';
import { LiveboardEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { RuntimeFilterOp } from '@thoughtspot/visual-embed-sdk';
import {
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Workflow,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchCadences, tsCustomizations, CadenceData } from '../lib/thoughtspot';
import { useTheme } from '../context/ThemeContext';
import {
  INLINE_INSIGHTS_LIVEBOARD_ID,
  LIVEBOARD_EMBED_FLAGS,
} from '../config';

const Liveboard = LiveboardEmbed as unknown as (props: any) => JSX.Element;

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: CadenceData };

export default function Processes() {
  const { username, password } = useAuth();
  const { theme } = useTheme();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setState({ status: 'loading' });
    setExpanded(null);
    try {
      const data = await fetchCadences(username, password);
      setState({ status: 'ready', data });
    } catch (e) {
      setState({
        status: 'error',
        message: e instanceof Error ? e.message : 'Unable to load processes.',
      });
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="tab-cadences">
      <div className="my-analytics-header">
        <div>
          <h1 className="page-title">Processes</h1>
          <p className="page-subtitle">
            {state.status === 'ready'
              ? `Process emissions & activity for your organization — select a process to view its insights`
              : 'Your processes, their emissions and activity records'}
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
          <p>Loading processes…</p>
        </div>
      )}

      {state.status === 'error' && (
        <div className="ma-state ma-error">
          <AlertCircle size={32} />
          <p className="ma-error-title">Couldn't load processes</p>
          <p className="ma-error-msg">{state.message}</p>
          <button className="refresh-btn" onClick={load}>
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      )}

      {state.status === 'ready' && (
        <div className="cadence-list">
          {state.data.cadences.map(({ name, details }) => {
            const isOpen = expanded === name;
            return (
              <div
                key={name}
                className={`cadence-row ${isOpen ? 'is-open' : ''}`}
              >
                <div className="cadence-row-header">
                  <span className="cadence-row-icon">
                    <Workflow size={17} />
                  </span>
                  <span className="cadence-row-name">{name}</span>
                  {details.length > 0 && (
                    <span className="cadence-row-details">
                      {details.map((d) => (
                        <span className="cadence-detail" key={d.label}>
                          <span className="cadence-detail-label">{d.label}</span>
                          <span className="cadence-detail-value">{d.value}</span>
                        </span>
                      ))}
                    </span>
                  )}
                  <button
                    className={`cadence-more-btn ${isOpen ? 'is-open' : ''}`}
                    onClick={() => setExpanded(isOpen ? null : name)}
                  >
                    <span>{isOpen ? 'Hide insights' : 'View insights'}</span>
                    <ChevronRight
                      size={16}
                      className={`cadence-row-chevron ${
                        isOpen ? 'is-open' : ''
                      }`}
                    />
                  </button>
                </div>

                {isOpen &&
                  (() => {
                    // Filter the inline viz to just this process. (Org scoping is
                    // already applied to the LIST; adding an org runtime filter
                    // here was over-filtering the viz to empty.) If the tile is
                    // still blank, viz PROCESS_INSIGHTS_VIZ_ID is not a tile on
                    // INLINE_INSIGHTS_LIVEBOARD_ID — repoint that constant.
                    const runtimeFilters = [
                      {
                        columnName: state.data.column,
                        operator: RuntimeFilterOp.EQ,
                        values: [name],
                      },
                    ];
                    console.debug('[sinai] inline insights', {
                      liveboardId: INLINE_INSIGHTS_LIVEBOARD_ID,
                      processColumn: state.data.column,
                      runtimeFilters,
                    });
                    return (
                      <div className="cadence-row-board">
                        <Liveboard
                          key={`${name}-${theme}`}
                          liveboardId={INLINE_INSIGHTS_LIVEBOARD_ID}
                          fullHeight
                          minimumHeight={160}
                          hideLiveboardHeader
                          hideTabPanel
                          visibleActions={[]}
                          runtimeFilters={runtimeFilters}
                          customizations={tsCustomizations(theme)}
                          {...LIVEBOARD_EMBED_FLAGS}
                        />
                      </div>
                    );
                  })()}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
