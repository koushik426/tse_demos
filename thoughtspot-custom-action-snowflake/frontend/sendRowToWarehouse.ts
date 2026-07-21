import { RowPayload } from './customActionPayload';

const env: Record<string, string | undefined> = (import.meta as any).env ?? {};

// The client's OWN ingest endpoint (their backend) — never Snowflake directly.
const INGEST_ENDPOINT = env.VITE_INGEST_ENDPOINT ?? '/api/ingest';
// Optional shared secret matching the backend's INGEST_SHARED_SECRET.
const INGEST_SECRET = env.VITE_INGEST_SECRET ?? '';

export async function sendRowToWarehouse(row: RowPayload): Promise<void> {
  const res = await fetch(INGEST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(INGEST_SECRET ? { 'x-ingest-secret': INGEST_SECRET } : {}),
    },
    body: JSON.stringify({
      actionId: row.actionId,
      record: row.record, // { columnName: value, ... }
      columns: row.columns, // ordered, if the table needs column order
      capturedAt: new Date().toISOString(),
    }),
  });
  if (!res.ok) {
    throw new Error(`Ingest failed (${res.status}): ${await res.text()}`);
  }
}
