# ThoughtSpot Custom Action → Snowflake

A generic, client-agnostic reference implementation for capturing a **ThoughtSpot
custom-action payload** (the row a user right-clicks in an embedded answer /
liveboard) and writing it into a **Snowflake table**.

It is intentionally decoupled and reusable — rename the constants, point it at
your cluster and warehouse, and go.

---

## How it works

```
┌─────────────────────┐   custom action    ┌──────────────────┐   HTTPS POST   ┌────────────────┐   INSERT   ┌───────────┐
│  ThoughtSpot embed  │  (right-click row) │  Frontend (React) │  /api/ingest   │  Backend (Node) │  SQL       │  Snowflake │
│  SearchEmbed        │ ─────────────────► │  extract payload  │ ─────────────► │  ingest handler │ ─────────► │  table     │
└─────────────────────┘                    └──────────────────┘                └────────────────┘            └───────────┘
```

1. A **code-based custom action** is registered inline on the embed (no admin
   setup needed). It appears in the answer's right-click context menu.
2. When clicked, ThoughtSpot fires `onCustomAction` with a payload describing the
   clicked row. The frontend flattens it into `{ columnName: value, ... }`.
3. The frontend **POSTs that JSON to your own backend**.
4. The backend inserts it into Snowflake using the Snowflake Node driver.

> **Why a backend?** Snowflake has no browser-safe driver, and warehouse
> credentials must never be shipped to the client. The browser only sends JSON;
> your service performs the insert. Swap the backend for whatever you already run
> (serverless function, existing API, Snowpipe/Kafka, etc.).

---

## Prerequisites

### ThoughtSpot
- A ThoughtSpot Cloud cluster with **embedding enabled**.
- Your app's origin **CORS-allowlisted** on the cluster
  (Develop → Customizations → Security settings).
- The **answer or liveboard-viz GUID** you want to embed.
- A user/service account for `AuthType` (this sample uses Basic; use SSO/trusted
  auth in production).

### Frontend
- Node.js **18+**
- React **18**
- `@thoughtspot/visual-embed-sdk` **^1.47**

### Backend
- Node.js **18+**
- A Snowflake account with:
  - a **warehouse**, **database**, and **schema**
  - a **role/user** with `INSERT` on the target table
    (password or, preferably, **key-pair** auth)

---

## Repository layout

```
thoughtspot-custom-action-snowflake/
├── README.md
├── frontend/
│   ├── initThoughtSpot.ts       # SDK init (auth + host)
│   ├── customActionPayload.ts   # generic payload → { record } extractor
│   ├── CustomActionEmbed.tsx    # embed + custom action registration
│   ├── sendRowToWarehouse.ts    # POST to your backend
│   └── .env.example
└── backend/
    ├── package.json
    ├── server.js                # Express + snowflake-sdk ingest endpoint
    ├── snowflake.sql            # landing-table DDL
    └── .env.example
```

---

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env          # fill in your Snowflake creds + INGEST_SHARED_SECRET
npm install
# create the landing table (run snowflake.sql in a Snowflake worksheet, or:)
#   snowsql -f snowflake.sql
npm start                     # listens on PORT (default 8787)
```

Health check: `curl http://localhost:8787/health` → `{"ok":true}`.

### 2. Frontend

Copy the four files in `frontend/` into your React app (adjust import paths),
then:

```bash
cp frontend/.env.example .env.local   # set VITE_* values
```

Wire it up:

```tsx
import { initThoughtSpot } from './initThoughtSpot';
import CustomActionEmbed from './CustomActionEmbed';

initThoughtSpot();                    // once, at app startup (after auth)

function Page() {
  return <CustomActionEmbed />;
}
```

Set these constants in `CustomActionEmbed.tsx` (or move them to env):

| Constant      | What it is                                              |
|---------------|---------------------------------------------------------|
| `ANSWER_ID`   | GUID of the answer/liveboard viz to embed               |
| `ACTION_ID`   | Stable id for your action (e.g. `push-to-warehouse`)    |
| `ACTION_NAME` | Label shown in the context menu (e.g. `Send to Snowflake`) |

---

## Testing the flow

1. Open the page → the embedded answer renders.
2. **Right-click a row** → choose your action label.
3. Browser Network tab → a `POST /api/ingest` with the row JSON.
4. Snowflake → `SELECT * FROM TS_CUSTOM_ACTION_EVENTS ORDER BY CAPTURED_AT DESC;`

Tip: `console.log(payload)` in `onCustomAction` once and confirm the shape on
your cluster — ThoughtSpot payload shapes vary slightly by action position and
release. The extractor already handles the common variants defensively.

---

## Customizing

- **Strongly-typed columns instead of VARIANT:** map `record` keys to real
  columns in the `INSERT` and enforce the column names in your ThoughtSpot answer.
- **Liveboard tiles:** set `target: CustomActionTarget.VISUALIZATION`.
- **Auth:** replace `AuthType.Basic` with SSO / trusted auth, and secure
  `/api/ingest` with the shared secret (included) or your own auth.
- **Batching / streaming:** for high volume, push to Snowpipe or a queue instead
  of a synchronous `INSERT`.

---

## Security checklist

- [ ] Snowflake credentials only on the backend (never in frontend env).
- [ ] `/api/ingest` requires the shared secret (or real auth).
- [ ] Backend validates/limits the payload before inserting.
- [ ] CORS on the backend restricted to your app origin.
- [ ] Prefer Snowflake **key-pair** auth over password in production.
