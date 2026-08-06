// HiveWatch — configuration (host, object GUIDs, and per-theme ThoughtSpot
// styling).
//
// ThoughtSpot theming references:
//   CSS variables:   https://developers.thoughtspot.com/docs/css-variables-reference
//   CSS framework:   https://developers.thoughtspot.com/docs/custom-css
//   rules_UNSTABLE:  https://developers.thoughtspot.com/docs/css-rules
//   LiveboardEmbed:  https://developers.thoughtspot.com/docs/embed-a-liveboard
//   SpotterEmbed:    https://developers.thoughtspot.com/docs/embed-spotter

const env: Record<string, string | undefined> = (import.meta as any).env ?? {};

export const THOUGHTSPOT_HOST = env.VITE_TS_HOST ?? 'https://team1.thoughtspot.cloud';

/** Liveboard shown on the Dashboard tab. */
export const DASHBOARD_LIVEBOARD_ID = 'cf9a225b-7981-4397-8439-303fb6609c35';

/** Worksheet / model powering "Ask HiveWatch AI" (Spotter). */
export const SPOTTER_WORKSHEET_ID = 'decfbfff-db5e-44ed-a14d-d5e3fbd566e9';

/** Standard LiveboardEmbed flags for this project. */
export const LIVEBOARD_EMBED_FLAGS = {
  isLiveboardMasterpiecesEnabled: true,
  fullHeight: true,
  // Updated Spotter interface on the liveboard (the on-board "Ask" panel).
  updatedSpotterChatPrompt: true,
};

/** Branding for the SpotterViz panel shown on the Dashboard liveboard. */
export const SPOTTER_VIZ_CONFIG = {
  brandName: 'HiveWatch AI',
  brandHeadline: "Hi! I'm",
  description: 'Ask anything about your security operations data.',
  inputChatPlaceholder: 'Ask HiveWatch AI…',
  spotterBrandName: 'HiveWatch AI',
};

/** Loads Outfit into embed iframes (they can't see the host page's font). */
export const TS_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap';

/**
 * Optional hosted, CSP-allowlisted theme stylesheets (see
 * public/thoughtspot-dark.css / thoughtspot-light.css). When set, they're used
 * as `customCSSUrl` for that theme — precise grid/toolbar overrides live there,
 * editable without rebuilding the app. Empty = fall back to the font URL + the
 * inline variables/rules below (still fully themed, minus the last-mile rules).
 */
export const TS_DARK_CSS_URL: string = env.VITE_TS_DARK_CSS_URL ?? '';
export const TS_LIGHT_CSS_URL: string = env.VITE_TS_LIGHT_CSS_URL ?? '';

export function tsCssUrlFor(theme: ThemeName): string {
  return (theme === 'dark' ? TS_DARK_CSS_URL : TS_LIGHT_CSS_URL) || TS_FONT_URL;
}

export type ThemeName = 'light' | 'dark';

const FONT = '"Outfit", "Segoe UI", sans-serif';

// ---------------------------------------------------------------------------
// ThoughtSpot CSS variables — one full set per theme, so embedded
// Liveboard/Spotter match the host app. Variable names are from the official
// CSS variables reference.
// ---------------------------------------------------------------------------

export const TS_VARS_LIGHT: Record<string, string> = {
  // Application-wide
  '--ts-var-root-background': '#ffffff',
  '--ts-var-root-color': '#16233b',
  '--ts-var-root-secondary-color': '#5b6b82',
  '--ts-var-root-font-family': FONT,
  '--ts-var-application-color': '#16233b',
  '--ts-var-segment-control-hover-background': '#eef2f8',
  // Nav
  '--ts-var-nav-background': '#ffffff',
  '--ts-var-nav-color': '#16233b',
  // Buttons
  '--ts-var-button-border-radius': '8px',
  '--ts-var-button--icon-border-radius': '8px',
  '--ts-var-button--primary-background': '#12b886',
  '--ts-var-button--primary-color': '#ffffff',
  '--ts-var-button--primary--hover-background': '#0ea373',
  '--ts-var-button--secondary-background': '#eef2f8',
  '--ts-var-button--secondary-color': '#16233b',
  '--ts-var-button--secondary--hover-background': '#e2e8f2',
  '--ts-var-button--tertiary-background': 'transparent',
  '--ts-var-button--tertiary-color': '#33415c',
  '--ts-var-button--tertiary--hover-background': '#eef2f8',
  // Menu
  '--ts-var-menu-background': '#ffffff',
  '--ts-var-menu-color': '#16233b',
  '--ts-var-menu--hover-background': '#eef2f8',
  '--ts-var-menu-selected-text-color': '#12b886',
  '--ts-var-menu-separator-background': '#e3e9f1',
  // Dialogs
  '--ts-var-dialog-body-background': '#ffffff',
  '--ts-var-dialog-body-color': '#16233b',
  '--ts-var-dialog-header-background': '#ffffff',
  '--ts-var-dialog-header-color': '#16233b',
  '--ts-var-dialog-footer-background': '#ffffff',
  // Lists
  '--ts-var-list-selected-background': '#eaf1fb',
  '--ts-var-list-hover-background': '#f2f5fa',
  // Liveboard
  '--ts-var-liveboard-layout-background': '#f5f8fc',
  '--ts-var-liveboard-edit-bar-background': '#ffffff',
  '--ts-var-liveboard-cross-filter-layout-background': '#ffffff',
  '--ts-var-liveboard-header-font-color': '#16233b',
  '--ts-var-liveboard-tile-border-radius': '12px',
  '--ts-var-parameter-chip-text-color': '#16233b',
  '--ts-var-liveboard-notetitle-heading-font-color': '#16233b',
  '--ts-var-liveboard-notetitle-body-font-color': '#33415c',
  // Masterpieces grouping/styling (active because isLiveboardMasterpiecesEnabled)
  '--ts-var-liveboard-group-background': '#f5f8fc',
  '--ts-var-liveboard-group-title-font-color': '#16233b',
  '--ts-var-liveboard-group-border-color': '#e3e9f1',
  '--ts-var-liveboard-group-description-font-color': '#7b8798',
  '--ts-var-liveboard-group-tile-title-font-color': '#16233b',
  '--ts-var-liveboard-group-tile-description-font-color': '#7b8798',
  '--ts-var-liveboard-tile-border-color': '#e3e9f1',
  '--ts-var-liveboard-tile-background': '#ffffff',
  // Viz / Answer
  '--ts-var-viz-background': '#ffffff',
  '--ts-var-viz-title-color': '#16233b',
  '--ts-var-viz-title-font-family': FONT,
  '--ts-var-viz-description-color': '#7b8798',
  '--ts-var-viz-border-radius': '12px',
  '--ts-var-viz-box-shadow': '0 1px 2px rgba(16,35,59,0.06), 0 8px 24px rgba(16,35,59,0.06)',
  '--ts-var-viz-legend-hover-background': '#eef2f8',
  '--ts-var-axis-title-color': '#7b8798',
  '--ts-var-axis-data-label-color': '#7b8798',
  '--ts-var-answer-view-table-chart-switcher-background': '#eef2f8',
  '--ts-var-answer-view-table-chart-switcher-active-background': '#ffffff',
  '--ts-var-answer-chart-select-background': '#eef2f8',
  '--ts-var-answer-chart-hover-background': '#e2e8f2',
  '--ts-var-answer-data-panel-background-color': '#f7f9fc',
  '--ts-var-answer-edit-panel-background-color': '#f7f9fc',
  // Filter chips
  '--ts-var-chip-background': '#eef2f8',
  '--ts-var-chip-color': '#33415c',
  '--ts-var-chip-border-radius': '9px',
  '--ts-var-chip--hover-background': '#e2e8f2',
  '--ts-var-chip--hover-color': '#16233b',
  '--ts-var-chip--active-background': '#12b886',
  '--ts-var-chip--active-color': '#ffffff',
  // Search
  '--ts-var-search-bar-background': '#f0f3f8',
  '--ts-var-search-bar-text-font-color': '#16233b',
  '--ts-var-search-data-button-background': '#12b886',
  '--ts-var-search-data-button-font-color': '#ffffff',
  '--ts-var-search-auto-complete-background': '#ffffff',
  '--ts-var-search-auto-complete-font-color': '#16233b',
  // Spotter
  '--ts-var-spotter-input-background': '#f0f3f8',
  '--ts-var-spotter-prompt-background': '#eef2f8',
  // Sage / NL search (Spotter conversational surfaces)
  '--ts-var-sage-embed-background-color': '#ffffff',
  '--ts-var-sage-bar-header-background-color': '#ffffff',
  '--ts-var-sage-search-box-background-color': '#f0f3f8',
  '--ts-var-sage-search-box-font-color': '#16233b',
  '--ts-var-source-selector-background-color': '#ffffff',
  '--ts-var-sage-seed-questions-background': '#f0f3f8',
  '--ts-var-sage-seed-questions-font-color': '#33415c',
  '--ts-var-sage-seed-questions-hover-background': '#eef2f8',
};

export const TS_VARS_DARK: Record<string, string> = {
  // Application-wide
  '--ts-var-root-background': '#0e1520',
  '--ts-var-root-color': '#e7edf3',
  '--ts-var-root-secondary-color': '#9aa6b4',
  '--ts-var-root-font-family': FONT,
  '--ts-var-application-color': '#e7edf3',
  '--ts-var-segment-control-hover-background': '#1b2636',
  // Nav
  '--ts-var-nav-background': '#0b1017',
  '--ts-var-nav-color': '#e7edf3',
  // Buttons
  '--ts-var-button-border-radius': '8px',
  '--ts-var-button--icon-border-radius': '8px',
  '--ts-var-button--primary-background': '#cbef39',
  '--ts-var-button--primary-color': '#0a0f16',
  '--ts-var-button--primary--hover-background': '#b6da2f',
  '--ts-var-button--secondary-background': '#1b2636',
  '--ts-var-button--secondary-color': '#e7edf3',
  '--ts-var-button--secondary--hover-background': '#243247',
  '--ts-var-button--tertiary-background': 'transparent',
  '--ts-var-button--tertiary-color': '#c7d2e2',
  '--ts-var-button--tertiary--hover-background': '#1b2636',
  // Menu
  '--ts-var-menu-background': '#111a27',
  '--ts-var-menu-color': '#e7edf3',
  '--ts-var-menu--hover-background': '#1b2636',
  '--ts-var-menu-selected-text-color': '#cbef39',
  '--ts-var-menu-separator-background': '#1b2636',
  // Dialogs
  '--ts-var-dialog-body-background': '#111a27',
  '--ts-var-dialog-body-color': '#e7edf3',
  '--ts-var-dialog-header-background': '#111a27',
  '--ts-var-dialog-header-color': '#e7edf3',
  '--ts-var-dialog-footer-background': '#111a27',
  // Lists
  '--ts-var-list-selected-background': '#1b2636',
  '--ts-var-list-hover-background': '#17212f',
  // Liveboard
  '--ts-var-liveboard-layout-background': '#0b1017',
  '--ts-var-liveboard-edit-bar-background': '#111a27',
  '--ts-var-liveboard-cross-filter-layout-background': '#111a27',
  '--ts-var-liveboard-header-font-color': '#e7edf3',
  '--ts-var-liveboard-tile-border-radius': '12px',
  '--ts-var-parameter-chip-text-color': '#e7edf3',
  '--ts-var-liveboard-notetitle-heading-font-color': '#e7edf3',
  '--ts-var-liveboard-notetitle-body-font-color': '#c7d2e2',
  // Masterpieces grouping/styling (active because isLiveboardMasterpiecesEnabled)
  '--ts-var-liveboard-group-background': '#0b1017',
  '--ts-var-liveboard-group-title-font-color': '#e7edf3',
  '--ts-var-liveboard-group-border-color': '#1b2636',
  '--ts-var-liveboard-group-description-font-color': '#9aa6b4',
  '--ts-var-liveboard-group-tile-title-font-color': '#e7edf3',
  '--ts-var-liveboard-group-tile-description-font-color': '#9aa6b4',
  '--ts-var-liveboard-tile-border-color': '#1b2636',
  '--ts-var-liveboard-tile-background': '#111a27',
  // Viz / Answer
  '--ts-var-viz-background': '#111a27',
  '--ts-var-viz-title-color': '#e7edf3',
  '--ts-var-viz-title-font-family': FONT,
  '--ts-var-viz-description-color': '#9aa6b4',
  '--ts-var-viz-border-radius': '12px',
  '--ts-var-viz-box-shadow': '0 1px 2px rgba(0,0,0,0.5)',
  '--ts-var-viz-legend-hover-background': '#1b2636',
  '--ts-var-axis-title-color': '#9aa6b4',
  '--ts-var-axis-data-label-color': '#9aa6b4',
  '--ts-var-answer-view-table-chart-switcher-background': '#1b2636',
  '--ts-var-answer-view-table-chart-switcher-active-background': '#0e1520',
  '--ts-var-answer-chart-select-background': '#1b2636',
  '--ts-var-answer-chart-hover-background': '#243247',
  '--ts-var-answer-data-panel-background-color': '#0b1017',
  '--ts-var-answer-edit-panel-background-color': '#0b1017',
  // Filter chips
  '--ts-var-chip-background': '#1b2636',
  '--ts-var-chip-color': '#c7d2e2',
  '--ts-var-chip-border-radius': '9px',
  '--ts-var-chip--hover-background': '#243247',
  '--ts-var-chip--hover-color': '#e7edf3',
  '--ts-var-chip--active-background': '#cbef39',
  '--ts-var-chip--active-color': '#0a0f16',
  // Search
  '--ts-var-search-bar-background': '#131d2b',
  '--ts-var-search-bar-text-font-color': '#e7edf3',
  '--ts-var-search-data-button-background': '#cbef39',
  '--ts-var-search-data-button-font-color': '#0a0f16',
  '--ts-var-search-auto-complete-background': '#111a27',
  '--ts-var-search-auto-complete-font-color': '#e7edf3',
  // Spotter
  '--ts-var-spotter-input-background': '#131d2b',
  '--ts-var-spotter-prompt-background': '#131d2b',
  // Sage / NL search (Spotter conversational surfaces)
  '--ts-var-sage-embed-background-color': '#0e1520',
  '--ts-var-sage-bar-header-background-color': '#0e1520',
  '--ts-var-sage-search-box-background-color': '#131d2b',
  '--ts-var-sage-search-box-font-color': '#e7edf3',
  '--ts-var-source-selector-background-color': '#111a27',
  '--ts-var-sage-seed-questions-background': '#131d2b',
  '--ts-var-sage-seed-questions-font-color': '#c7d2e2',
  '--ts-var-sage-seed-questions-hover-background': '#1b2636',
};

// Dark-only, color-only overrides (background + text) for surfaces with no
// dedicated variable, plus the KPI headline/number brand color.
const DARK_SURFACE = '#111a27';
const DARK_INK = '#e7edf3';
const surfaceRule = { 'background-color': `${DARK_SURFACE} !important`, color: `${DARK_INK} !important` };

export const TS_RULES_DARK: Record<string, Record<string, string>> = {
  // All text inputs/textareas (not checkboxes/radios) + their field wrappers.
  [[
    'input:not([type="checkbox"]):not([type="radio"])',
    'textarea',
    '[class*="input" i]',
    '[class*="field" i]',
    '[class*="textbox" i]',
    '[class*="find" i]',
    '[class*="searchbox" i]',
  ].join(',')]: {
    'background-color': '#131d2b !important',
    color: `${DARK_INK} !important`,
  },
  // Toggles / switchers / layout controls.
  [[
    '[class*="toggle" i]',
    '[class*="switch" i]',
    '[class*="switcher" i]',
    '[class*="layout" i]',
  ].join(',')]: {
    'background-color': `${DARK_SURFACE} !important`,
    color: `${DARK_INK} !important`,
  },
  // Dropdown / select header (e.g. dimension & filter pickers).
  '[data-testid="select-dropdown-header"]': {
    'background-color': '#131d2b !important',
    color: `${DARK_INK} !important`,
  },
  // Answer / conversation / Spotter surfaces — the white answer card & footer.
  [[
    '[class*="answer" i]',
    '[class*="conversation" i]',
    '[class*="message" i]',
    '[class*="spotter" i]',
    '[class*="sage" i]',
  ].join(',')]: surfaceRule,
  // Genuine floating chrome only — panels/modals/menus.
  [[
    '[class*="modal" i]',
    '[class*="dialog" i]',
    '[class*="popover" i]',
    '[class*="flyout" i]',
    '[class*="drawer" i]',
    '[class*="data-panel" i]',
    '[class*="dataPanel" i]',
  ].join(',')]: surfaceRule,
  // KPI tile headline + numbers → brand lime.
  [[
    '[class*="kpi" i]',
    '[class*="headline" i]',
    '.bk-data-viz-headline-container',
    '.bk-data-viz-headline-container .bk-overflow-ellipsis',
  ].join(',')]: {
    color: '#CBEF38 !important',
  },
};

export function tsVarsFor(theme: ThemeName): Record<string, string> {
  return theme === 'dark' ? TS_VARS_DARK : TS_VARS_LIGHT;
}

/** Rename Spotter → "HiveWatch AI" across every embed. */
export const TS_STRINGS: Record<string, string> = {
  Spotter: 'HiveWatch AI',
};
