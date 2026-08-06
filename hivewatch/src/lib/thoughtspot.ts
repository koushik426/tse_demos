// ThoughtSpot integration: SDK init, per-theme customizations, and the REST v2
// helpers used by "My Reports" and "Create".
//
// References:
//   init() / EmbedConfig: https://developers.thoughtspot.com/docs/getting-started
//   AuthType:             https://developers.thoughtspot.com/docs/embed-authentication
//   REST API v2:          https://developers.thoughtspot.com/docs/rest-apiv2-reference
//     - metadata/search   (list liveboards)
//     - metadata/tml/import (create a liveboard from TML)
import { init, AuthType } from '@thoughtspot/visual-embed-sdk';
import {
  THOUGHTSPOT_HOST,
  TS_FONT_URL,
  TS_STRINGS,
  TS_RULES_DARK,
  tsVarsFor,
  tsCssUrlFor,
  ThemeName,
} from '../config';

let isInitialized = false;

/** Initialise the Visual Embed SDK (Basic auth). Theme is applied per-embed. */
export function initThoughtSpot(username: string, password: string) {
  if (isInitialized) return;
  init({
    thoughtSpotHost: THOUGHTSPOT_HOST,
    authType: AuthType.Basic,
    username,
    password,
    customizations: {
      style: {
        customCSSUrl: TS_FONT_URL,
        customCSS: { variables: tsVarsFor('light') },
      },
      content: { strings: TS_STRINGS },
    },
  });
  isInitialized = true;
}

/**
 * Per-embed customizations for the active theme. Passing this to each embed and
 * flipping `theme` re-inits the embed (SDK deep-compares props) so the
 * Liveboard/Spotter colors track the host app's light/dark mode.
 */
export function tsCustomizations(theme: ThemeName) {
  return {
    style: {
      // Hosted themed stylesheet when configured, else the font URL. Inline
      // variables/rules below load AFTER customCSSUrl and act as a fallback.
      customCSSUrl: tsCssUrlFor(theme),
      customCSS: {
        variables: tsVarsFor(theme),
        ...(theme === 'dark' ? { rules_UNSTABLE: TS_RULES_DARK } : {}),
      },
    },
    content: { strings: TS_STRINGS },
  };
}

// ---------------------------------------------------------------------------
// "My Reports" — list liveboards the signed-in user can access (metadata/search).
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

async function ensureRestSession(username: string, password: string) {
  try {
    await fetch(`${THOUGHTSPOT_HOST}/api/rest/2.0/auth/session/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username, password, remember_me: true }),
    });
  } catch {
    /* SDK Basic session may already authorize us */
  }
}

async function metadataSearch(body: unknown): Promise<any[]> {
  const res = await fetch(`${THOUGHTSPOT_HOST}/api/rest/2.0/metadata/search`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = '';
    try {
      detail = (await res.text()).slice(0, 200);
    } catch {
      /* ignore */
    }
    throw new Error(`metadata/search failed (${res.status})${detail ? `: ${detail}` : ''}`);
  }
  const data = await res.json();
  if (Array.isArray(data)) return data;
  return data.records ?? data.data ?? [];
}

function mapLiveboard(item: any): LiveboardSummary {
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

const GUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function extractNewGuid(data: any): string | undefined {
  const items = Array.isArray(data) ? data : [data];
  for (const item of items) {
    const status = item?.response?.status ?? item?.status;
    const code = status?.status_code ?? status?.code;
    if (code && String(code).toUpperCase() !== 'OK') {
      throw new Error(status?.error_message ?? JSON.stringify(status).slice(0, 200));
    }
  }
  for (const item of items) {
    const cands = [
      item?.response?.header?.id_guid,
      item?.response?.header?.metadata_id_guid,
      item?.header?.id_guid,
      item?.metadata_id_guid,
      item?.id_guid,
    ];
    for (const c of cands) if (typeof c === 'string' && GUID_RE.test(c)) return c;
  }
  let found: string | undefined;
  const walk = (o: any) => {
    if (found || !o || typeof o !== 'object') return;
    for (const [k, v] of Object.entries(o)) {
      if (found) return;
      if (/^(id_guid|metadata_id_guid|guid)$/i.test(k) && typeof v === 'string' && GUID_RE.test(v)) {
        found = v;
        return;
      }
      if (v && typeof v === 'object') walk(v);
    }
  };
  walk(data);
  return found;
}

/** Create a new empty liveboard via TML import; returns its GUID. */
export async function createEmptyLiveboard(
  username: string,
  password: string,
  name = 'New Dashboard',
): Promise<string> {
  await ensureRestSession(username, password);
  const res = await fetch(`${THOUGHTSPOT_HOST}/api/rest/2.0/metadata/tml/import`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      metadata_tmls: [`liveboard:\n  name: ${JSON.stringify(name)}\n`],
      import_policy: 'ALL_OR_NONE',
      create_new: true,
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Create liveboard failed (${res.status})${text ? `: ${text.slice(0, 200)}` : ''}`);
  }
  const guid = extractNewGuid(JSON.parse(text));
  if (!guid) throw new Error(`No liveboard GUID in response: ${text.slice(0, 200)}`);
  return guid;
}

/** Every liveboard the signed-in user can access, newest-modified first. */
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
    .map(mapLiveboard)
    .filter((lb) => !!lb.id)
    .sort((a, b) => b.modified - a.modified);
}
