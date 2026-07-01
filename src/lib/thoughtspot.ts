import { init, AuthType } from '@thoughtspot/visual-embed-sdk';
import {
  THOUGHTSPOT_HOST,
  CADENCE_WORKSHEET_ID,
  CADENCE_COLUMN_CANDIDATES,
  CADENCE_DETAIL_COLUMNS,
  TS_CSS_VARIABLES,
  TS_ICON_SPRITE_URL,
  TS_STRINGS,
  TS_STRING_IDS,
} from '../config';

let isInitialized = false;

/**
 * Initialise the ThoughtSpot Visual Embed SDK with Salesloft styling.
 * Styling (CSS variables + spotter icon) comes straight from salesloft_fin.json
 * so every embed across the three tabs shares the exact same theme.
 */
export function initThoughtSpot(username: string, password: string) {
  if (isInitialized) return;
  init({
    thoughtSpotHost: THOUGHTSPOT_HOST,
    authType: AuthType.Basic,
    username,
    password,
    customizations: {
      style: {
        customCSS: { variables: TS_CSS_VARIABLES },
      },
      iconSpriteUrl: TS_ICON_SPRITE_URL,
      // Global text overrides — replaces "Spotter" -> "Salesloft AI" (and the
      // landing-page string) as substrings across every embed. Set in init()
      // so it applies to Liveboard, Search/Answer, Spotter and the chatbot.
      content: {
        strings: TS_STRINGS,
        stringIDs: TS_STRING_IDS,
      },
    },
  });
  isInitialized = true;
}

/** Shared `customizations` block for every embedded ThoughtSpot component. */
export function tsCustomizations(
  withStringReplacements: boolean,
  extraRules?: Record<string, Record<string, string>>,
) {
  return {
    style: {
      customCSS: {
        variables: TS_CSS_VARIABLES,
        ...(extraRules ? { rules_UNSTABLE: extraRules } : {}),
      },
    },
    iconSpriteUrl: TS_ICON_SPRITE_URL,
    ...(withStringReplacements
      ? { content: { strings: TS_STRINGS, stringIDs: TS_STRING_IDS } }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// REST API v2 helpers (used by the "My Analytics" tab)
// ---------------------------------------------------------------------------

export interface LiveboardSummary {
  id: string;
  name: string;
  description: string;
  authorName: string;
  authorDisplayName: string;
  modified: number; // epoch ms
  views?: number;
}

// --- Cookie-based auth: reuse the session the SDK established at login --------

let sessionReady = false;

/**
 * Establish a REST session cookie. The SDK `init` (AuthType.Basic) already logs
 * the user in, but we call session/login once more to be certain the cookie is
 * present for top-window fetches. Errors are swallowed — the existing SDK
 * session may already be valid.
 */
export async function ensureRestSession(username: string, password: string) {
  if (sessionReady) return;
  try {
    await fetch(`${THOUGHTSPOT_HOST}/api/rest/2.0/auth/session/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ username, password, remember_me: true }),
    });
    sessionReady = true;
  } catch {
    /* fall through — the SDK iframe session may already authorize us */
  }
}

async function metadataSearch(body: unknown): Promise<any[]> {
  const res = await fetch(
    `${THOUGHTSPOT_HOST}/api/rest/2.0/metadata/search`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    let detail = '';
    try {
      detail = (await res.text()).slice(0, 200);
    } catch {
      /* ignore */
    }
    throw new Error(
      `metadata/search failed (${res.status})${detail ? `: ${detail}` : ''}`,
    );
  }
  const data = await res.json();
  // v2.0 returns a plain array; tolerate { records } / { data } shapes too.
  if (Array.isArray(data)) return data;
  return data.records ?? data.data ?? [];
}

function mapResult(item: any): LiveboardSummary {
  const header = item.metadata_header ?? item.header ?? {};
  return {
    id: item.metadata_id ?? item.id ?? header.id,
    name: item.metadata_name ?? header.name ?? 'Untitled liveboard',
    description: header.description ?? '',
    authorName: header.authorName ?? item.author_name ?? '',
    authorDisplayName:
      header.authorDisplayName ?? header.authorName ?? item.author_name ?? '',
    modified: header.modified ?? item.modified ?? 0,
    views: item.stats?.views ?? header.views,
  };
}

/**
 * Fetch every liveboard the signed-in user can access (mirrors the
 * "My Reports" listing in salesloft_fin.json). Sorted most-recently-modified
 * first. No author filter — the REST API already scopes results to objects the
 * caller has read access to.
 */
export async function searchLiveboards(
  username: string,
  password: string,
): Promise<LiveboardSummary[]> {
  await ensureRestSession(username, password);
  const raw = await metadataSearch({
    metadata: [{ type: 'LIVEBOARD' }],
    record_size: -1,
    record_offset: 0,
  });
  return raw
    .map(mapResult)
    .filter((lb) => !!lb.id)
    .sort((a, b) => b.modified - a.modified);
}

export function liveboardUrl(id: string): string {
  return `${THOUGHTSPOT_HOST}/#/pinboard/${id}`;
}

// ---------------------------------------------------------------------------
// Search Data API — used by the "Inline Insights" tab to list cadence names
// ---------------------------------------------------------------------------

export interface CadenceDetail {
  label: string;
  format: 'text' | 'date' | 'number' | 'currency';
  value: string;
}

export interface CadenceRow {
  name: string;
  details: CadenceDetail[];
}

export interface CadenceData {
  /** The worksheet column that held the cadence names (also the filter column). */
  column: string;
  cadences: CadenceRow[];
}

async function searchData(
  queryString: string,
  recordSize = 1000,
): Promise<{ column_names: string[]; data_rows: any[] } | null> {
  const res = await fetch(`${THOUGHTSPOT_HOST}/api/rest/2.0/searchdata`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query_string: queryString,
      logical_table_identifier: CADENCE_WORKSHEET_ID,
      data_format: 'COMPACT',
      record_size: recordSize,
    }),
  });
  if (!res.ok) return null; // let the caller try the next candidate column
  const data = await res.json();
  const c = data.contents?.[0];
  return c ? { column_names: c.column_names, data_rows: c.data_rows } : null;
}

function cell(row: any, index: number, columnNames: string[]): string {
  const value = Array.isArray(row) ? row[index] : row[columnNames[index]];
  return value == null ? '' : String(value).trim();
}

function formatDetail(raw: string, format: CadenceDetail['format']): string {
  if (!raw) return '—';
  if (format === 'date') {
    const num = Number(raw);
    // ThoughtSpot COMPACT often returns epoch seconds for date columns.
    if (!Number.isNaN(num) && /^\d{9,13}$/.test(raw)) {
      const ms = raw.length <= 10 ? num * 1000 : num;
      return new Date(ms).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return raw;
  }
  const num = Number(raw);
  if (format === 'number') {
    return Number.isNaN(num) ? raw : num.toLocaleString('en-US');
  }
  if (format === 'currency') {
    if (Number.isNaN(num)) return raw;
    const abs = Math.abs(num);
    if (abs >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
    return `$${num.toLocaleString('en-US')}`;
  }
  return raw;
}

/** Resolve a "[cadence] [metric]" pairing into a cadence→value map. */
async function fetchMetricMap(
  cadenceCol: string,
  candidates: string[],
): Promise<Map<string, string> | null> {
  for (const candidate of candidates) {
    const result = await searchData(`[${cadenceCol}] [${candidate}]`, 2000);
    if (!result || !result.data_rows?.length) continue;
    const map = new Map<string, string>();
    for (const row of result.data_rows) {
      const key = cell(row, 0, result.column_names);
      if (key && !map.has(key)) map.set(key, cell(row, 1, result.column_names));
    }
    if (map.size) return map;
  }
  return null;
}

/**
 * Fetch cadence names plus their owner / created date / emails replied /
 * influenced pipeline. Each metric column is resolved from candidate names
 * (first match wins); metrics with no match are omitted. Returns the resolved
 * cadence column so the Inline Insights tab can use it as a runtime filter.
 */
export async function fetchCadences(
  username: string,
  password: string,
): Promise<CadenceData> {
  await ensureRestSession(username, password);

  let cadenceCol = '';
  let names: string[] = [];
  for (const col of CADENCE_COLUMN_CANDIDATES) {
    const result = await searchData(`[${col}]`);
    if (!result || !result.data_rows?.length) continue;
    const seen = new Set<string>();
    for (const row of result.data_rows) {
      const name = cell(row, 0, result.column_names);
      if (name) seen.add(name);
    }
    if (seen.size) {
      cadenceCol = col;
      names = Array.from(seen).sort((a, b) => a.localeCompare(b));
      break;
    }
  }
  if (!cadenceCol) {
    throw new Error(
      `No cadence column found on the worksheet (tried: ${CADENCE_COLUMN_CANDIDATES.join(
        ', ',
      )}).`,
    );
  }

  // Resolve each detail metric in parallel.
  const metricKeys = Object.keys(CADENCE_DETAIL_COLUMNS) as Array<
    keyof typeof CADENCE_DETAIL_COLUMNS
  >;
  const maps = await Promise.all(
    metricKeys.map((k) =>
      fetchMetricMap(cadenceCol, CADENCE_DETAIL_COLUMNS[k].candidates),
    ),
  );

  const cadences: CadenceRow[] = names.map((name) => {
    const details: CadenceDetail[] = [];
    metricKeys.forEach((key, i) => {
      const map = maps[i];
      if (!map) return;
      const spec = CADENCE_DETAIL_COLUMNS[key];
      details.push({
        label: spec.label,
        format: spec.format,
        value: formatDetail(map.get(name) ?? '', spec.format),
      });
    });
    return { name, details };
  });

  return { column: cadenceCol, cadences };
}
