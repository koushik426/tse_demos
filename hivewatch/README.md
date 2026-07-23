# HiveWatch — ThoughtSpot Embedded Analytics Demo

A reference single-page app that embeds **ThoughtSpot** (Liveboard, Spotter, and
Search) inside a HiveWatch-style security-operations console, with a **dark/light
theme toggle** that themes the ThoughtSpot embeds consistently.

It's a client-agnostic template: repoint the host + GUIDs, reskin the CSS tokens,
and ship.

---

## What's in it

| View | What it shows | ThoughtSpot piece |
|------|---------------|-------------------|
| **Dashboard** | A liveboard, full-width, with the on-board Spotter ("Ask HiveWatch AI") panel | [`LiveboardEmbed`](https://developers.thoughtspot.com/docs/embed-a-liveboard) |
| **My Reports** | Grid of every liveboard the user can access, with search; opens one full-width | REST [`metadata/search`](https://developers.thoughtspot.com/docs/rest-apiv2-reference) + `LiveboardEmbed` |
| **Ask HiveWatch AI** | Full Spotter natural-language experience with the updated chat prompt + past-conversations panel | [`SpotterEmbed`](https://developers.thoughtspot.com/docs/embed-spotter) |
| **Create ➕** (top bar) | Creates an empty liveboard via TML import and opens it in **edit mode** with the Spotter viz | REST [`metadata/tml/import`](https://developers.thoughtspot.com/docs/rest-apiv2-reference) + [`HostEvent.Edit`](https://developers.thoughtspot.com/docs/Enumeration_HostEvent) |
| **Theme toggle** (top right) | Switches the whole app + embeds between dark and light | [CSS customization](https://developers.thoughtspot.com/docs/custom-css) |

---

## Prerequisites

- **Node.js 18+**
- A **ThoughtSpot Cloud** cluster with embedding enabled.
- Your dev origin (e.g. `http://localhost:3200`) **CORS-allowlisted** on the
  cluster: *Develop → Customizations → Security settings*. Required for the REST
  calls (My Reports listing, Create). See
  [Security settings](https://developers.thoughtspot.com/docs/security-settings).
- A user for authentication. This demo uses **Basic auth** for simplicity; use
  [SSO / trusted auth](https://developers.thoughtspot.com/docs/embed-authentication)
  in production.
- The object GUIDs you want to embed (dashboard liveboard + Spotter model).

---

## Setup

```bash
cd hivewatch
cp .env.example .env      # optional: override the host / theme CSS URLs
npm install
npm run dev               # http://localhost:3200
```

Sign in with your ThoughtSpot username + password. The default host and GUIDs
are in [`src/config.ts`](src/config.ts).

---

## Configuration — [`src/config.ts`](src/config.ts)

| Constant | Meaning |
|----------|---------|
| `THOUGHTSPOT_HOST` | Cluster URL (env: `VITE_TS_HOST`) |
| `DASHBOARD_LIVEBOARD_ID` | Liveboard shown on the Dashboard tab |
| `SPOTTER_WORKSHEET_ID` | Worksheet/model powering Ask HiveWatch AI |
| `LIVEBOARD_EMBED_FLAGS` | Shared LiveboardEmbed flags (masterpieces, fullHeight, updated Spotter prompt) |
| `SPOTTER_VIZ_CONFIG` | Branding for the on-liveboard Spotter panel |
| `TS_VARS_LIGHT` / `TS_VARS_DARK` | Full `--ts-var-*` sets per theme |
| `TS_RULES_DARK` | `rules_UNSTABLE` selector overrides for dark surfaces without a variable |
| `VITE_TS_DARK_CSS_URL` / `VITE_TS_LIGHT_CSS_URL` | Optional hosted theme stylesheets (see below) |

---

## Theming

The app switches theme via a `data-theme` attribute on `<html>` (host CSS) and by
passing per-embed `customizations` for the active theme (ThoughtSpot embeds).
Because the SDK deep-compares props, flipping the theme re-applies the embed
colors. See the [CSS variables reference](https://developers.thoughtspot.com/docs/css-variables-reference)
and [CSS customization framework](https://developers.thoughtspot.com/docs/custom-css).

Two layers:
1. **`customCSS.variables`** — the documented `--ts-var-*` variables. Portable
   across clusters/versions. This is the bulk of the theming.
2. **`customCSS.rules_UNSTABLE`** — CSS selector overrides for surfaces with no
   variable (some inputs, pickers, the answer card). These are **version-fragile**
   (class names can change between releases) — see the
   [rules docs](https://developers.thoughtspot.com/docs/css-rules). Tweak via
   right-click → Inspect on your cluster if a release renames a class.

### Optional: hosted theme stylesheets
For heavier theming (e.g. deep grid/toolbar internals), host
[`public/thoughtspot-dark.css`](public/thoughtspot-dark.css) /
[`public/thoughtspot-light.css`](public/thoughtspot-light.css) on a CDN,
allowlist the origin in the cluster CSP (`style-src`), and set
`VITE_TS_DARK_CSS_URL` / `VITE_TS_LIGHT_CSS_URL`. They're used as the embed's
`customCSSUrl`; the inline variables still load after as a fallback.

A ready-to-share theme in the SDK's `customizations` shape is provided at
[`thoughtspot-dark-customizations.json`](thoughtspot-dark-customizations.json).

---

## Project structure

```
hivewatch/
├── src/
│   ├── config.ts              # host, GUIDs, theme variable sets, rules
│   ├── lib/thoughtspot.ts     # SDK init, per-theme customizations, REST helpers
│   ├── context/
│   │   ├── ThemeContext.tsx   # dark/light state (persisted)
│   │   └── AuthContext.tsx    # Basic-auth session
│   ├── components/            # Sidebar, TopBar (theme toggle + Create), Logo
│   ├── pages/
│   │   ├── Dashboard.tsx      # LiveboardEmbed
│   │   ├── MyReports.tsx      # metadata/search grid + selected liveboard
│   │   ├── AskAI.tsx          # SpotterEmbed
│   │   ├── CreateBoard.tsx    # create empty liveboard → edit mode
│   │   └── Login.tsx
│   └── styles/globals.css     # host theme tokens (light/dark)
├── public/                    # optional hosted theme stylesheets
└── thoughtspot-dark-customizations.json
```

---

## Reference

- [Visual Embed SDK](https://developers.thoughtspot.com/docs/visual-embed-sdk)
- [Embed a Liveboard](https://developers.thoughtspot.com/docs/embed-a-liveboard) ·
  [Embed Spotter](https://developers.thoughtspot.com/docs/embed-spotter) ·
  [Embed Search](https://developers.thoughtspot.com/docs/embed-search-page)
- [HostEvent](https://developers.thoughtspot.com/docs/Enumeration_HostEvent) ·
  [Actions](https://developers.thoughtspot.com/docs/Enumeration_Action)
- [CSS customization](https://developers.thoughtspot.com/docs/custom-css) ·
  [CSS variables reference](https://developers.thoughtspot.com/docs/css-variables-reference)
- [Authentication](https://developers.thoughtspot.com/docs/embed-authentication) ·
  [Security settings / CORS + CSP](https://developers.thoughtspot.com/docs/security-settings)

## Caveats

- **Basic auth** ships credentials to the browser — demo only. Use SSO/trusted
  auth for production.
- **REST calls** (My Reports, Create) require the app origin allowlisted for CORS
  on the cluster.
- **Dark mode** is achieved via CSS variables + rules; ThoughtSpot has no single
  "dark mode" switch, so a few deep data-grid/toolbar internals may need per-cluster
  rule tweaks.
