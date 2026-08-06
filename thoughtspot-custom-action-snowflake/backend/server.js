// Minimal ingest service: receives a ThoughtSpot custom-action row payload and
// inserts it into Snowflake. Run with `npm start`.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const snowflake = require('snowflake-sdk');

const {
  PORT = 8787,
  CORS_ORIGIN = '*',
  INGEST_SHARED_SECRET = '',
  SF_ACCOUNT,
  SF_USER,
  SF_PASSWORD,
  SF_WAREHOUSE,
  SF_DATABASE,
  SF_SCHEMA,
  SF_TABLE = 'TS_CUSTOM_ACTION_EVENTS',
} = process.env;

// --- Snowflake connection ---------------------------------------------------
const connection = snowflake.createConnection({
  account: SF_ACCOUNT,
  username: SF_USER,
  password: SF_PASSWORD, // swap for key-pair / OAuth in production
  warehouse: SF_WAREHOUSE,
  database: SF_DATABASE,
  schema: SF_SCHEMA,
});

connection.connect((err) => {
  if (err) {
    console.error('Snowflake connect error:', err.message);
    process.exit(1);
  }
  console.log('Connected to Snowflake.');
});

// --- HTTP server ------------------------------------------------------------
const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '256kb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/ingest', (req, res) => {
  // Optional shared-secret gate (set INGEST_SHARED_SECRET to enable).
  if (INGEST_SHARED_SECRET && req.get('x-ingest-secret') !== INGEST_SHARED_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const { record, actionId, capturedAt } = req.body || {};
  if (!record || typeof record !== 'object') {
    return res.status(400).json({ error: 'record (object) required' });
  }

  // Schema-flexible landing table: a single VARIANT column accepts any column
  // set the answer produces, with no DDL changes. See snowflake.sql.
  connection.execute({
    sqlText: `INSERT INTO ${SF_TABLE} (ACTION_ID, PAYLOAD, CAPTURED_AT)
              SELECT ?, PARSE_JSON(?), ?`,
    binds: [
      actionId || null,
      JSON.stringify(record),
      capturedAt || new Date().toISOString(),
    ],
    complete: (err) => {
      if (err) {
        console.error('Insert error:', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ ok: true });
    },
  });
});

app.listen(PORT, () => console.log(`Ingest service listening on :${PORT}`));
