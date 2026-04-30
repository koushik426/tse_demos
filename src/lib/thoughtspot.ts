import { init, AuthType } from '@thoughtspot/visual-embed-sdk';

let isInitialized = false;

export function initThoughtSpot(username: string, password: string) {
  if (isInitialized) return;
  init({
    thoughtSpotHost: 'https://se-thoughtspot-cloud.thoughtspot.cloud',
    authType: AuthType.Basic,
    username,
    password,
    customizations: {
      style: {
        customCSS: {
          rules_UNSTABLE: {
            '.footer-module__footerLogo': { display: 'none !important' },
            '.footer-module__footer': { display: 'none !important' },
            "[class*='footer-module']": { display: 'none !important' },
            "img[alt*='Powered by']": { display: 'none !important' },
          },
        },
      },
    },
  });
  isInitialized = true;
}
