// Official SINAI logo (fetched from sinai.com, "on-light" variant).
// Inlined so its ink can follow `currentColor` — dark evergreen on light
// surfaces, light on dark surfaces — while keeping the lime accent. Color is
// set by the host (.sl-logo → var(--sl-evergreen)); height comes from `size`.
import logoRaw from '../assets/sinai-logo.svg?raw';

interface Props {
  className?: string;
  /** Logo height in px (default 26). */
  size?: number;
  /** Kept for API compatibility; the official lockup always includes the wordmark. */
  wordmark?: boolean;
}

export default function SINAILogo({ className, size = 26 }: Props) {
  return (
    <span
      className={`sl-logo ${className ?? ''}`}
      style={{ height: size }}
      role="img"
      aria-label="SINAI"
      dangerouslySetInnerHTML={{ __html: logoRaw }}
    />
  );
}
