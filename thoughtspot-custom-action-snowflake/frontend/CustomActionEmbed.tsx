import { useState } from 'react';
import { SearchEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { CustomActionsPosition, CustomActionTarget } from '@thoughtspot/visual-embed-sdk';
import { extractRowPayload } from './customActionPayload';
import { sendRowToWarehouse } from './sendRowToWarehouse';

const Search = SearchEmbed as unknown as (props: any) => JSX.Element;

// --- Configure per client -------------------------------------------------
const ANSWER_ID = '<your-answer-or-liveboard-viz-id>';
const ACTION_ID = 'push-to-warehouse'; // stable id, matched in the handler
const ACTION_NAME = 'Send to Snowflake'; // label shown in the context menu
// --------------------------------------------------------------------------

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'ok' } | { kind: 'error'; msg: string };

export default function CustomActionEmbed() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function onCustomAction(payload: any) {
    const data = payload?.data ?? payload;
    if (data?.id !== ACTION_ID) return; // ignore other custom actions

    const row = extractRowPayload(payload);
    setStatus({ kind: 'sending' });
    try {
      await sendRowToWarehouse(row);
      setStatus({ kind: 'ok' });
    } catch (e) {
      console.error('[custom action] warehouse ingest failed', e);
      setStatus({ kind: 'error', msg: e instanceof Error ? e.message : 'Ingest failed' });
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {status.kind === 'sending' && <div style={banner}>Sending to Snowflake…</div>}
      {status.kind === 'ok' && <div style={{ ...banner, background: '#0a7' }}>Sent ✓</div>}
      {status.kind === 'error' && (
        <div style={{ ...banner, background: '#c0392b' }}>Error: {status.msg}</div>
      )}
      <Search
        answerId={ANSWER_ID}
        frameParams={{ width: '100%', height: '100%' }}
        customActions={[
          {
            id: ACTION_ID,
            name: ACTION_NAME,
            position: CustomActionsPosition.CONTEXTMENU, // right-click a row
            target: CustomActionTarget.ANSWER,
          },
        ]}
        onCustomAction={onCustomAction}
      />
    </div>
  );
}

const banner: React.CSSProperties = {
  position: 'absolute',
  top: 8,
  right: 8,
  zIndex: 10,
  background: '#333',
  color: '#fff',
  padding: '6px 12px',
  borderRadius: 8,
  fontSize: 13,
};
