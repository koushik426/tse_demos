// One-time ThoughtSpot Visual Embed SDK initialization.
// Call initThoughtSpot() at app startup (after your app has the user's session).
import { init, AuthType } from '@thoughtspot/visual-embed-sdk';

const env: Record<string, string | undefined> = (import.meta as any).env ?? {};

const THOUGHTSPOT_HOST = env.VITE_TS_HOST ?? 'https://your-cluster.thoughtspot.cloud';

let initialized = false;

export function initThoughtSpot(username?: string, password?: string): void {
  if (initialized) return;
  init({
    thoughtSpotHost: THOUGHTSPOT_HOST,
    // Demo uses Basic auth. In production prefer SSO / trusted auth.
    authType: AuthType.Basic,
    username,
    password,
  });
  initialized = true;
}
