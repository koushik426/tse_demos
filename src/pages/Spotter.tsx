import { ConversationEmbed } from '@thoughtspot/visual-embed-sdk/react';
import Header from '../components/Header';

const WORKSHEET_ID = 'a44c223e-451f-4635-a8b0-86832bf355dd';
const SL_FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export default function Spotter() {
  return (
    <>
      <Header
        title="AI Sales Assistant"
        subtitle="Ask questions about your sales data in plain English"
      />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <h2 className="page-title">AI-Powered Sales Insights</h2>
            <p className="page-subtitle">
              Try asking: "Which deals are at risk?", "Who are my top reps this quarter?", or "Show pipeline by stage"
            </p>
          </div>
          <div className="embed-container">
            <ConversationEmbed
              worksheetId={WORKSHEET_ID}
              hideSourceSelection={true}
              frameParams={{ width: '100%', height: '100%' }}
              customizations={{
                style: {
                  customCSS: {
                    variables: {
                      '--ts-var-root-font-family': SL_FONT,
                      '--ts-var-button--primary-background': '#4B75FD',
                      '--ts-var-button--primary-color': '#ffffff',
                    },
                    rules_UNSTABLE: {
                      '.footer-module__footerLogo': { display: 'none !important' },
                      '.footer-module__footer': { display: 'none !important' },
                      "[class*='footer-module']": { display: 'none !important' },
                      'body, .bk-root, *': { fontFamily: `${SL_FONT} !important` },
                    },
                  },
                },
              }}
              onLoad={() => console.log('Spotter loaded')}
            />
          </div>
        </div>
      </main>
    </>
  );
}
