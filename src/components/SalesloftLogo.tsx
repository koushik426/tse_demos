// Salesloft wordmark approximation — their rebrand uses a custom humanist serif
// ("Nib") in tonal greens. We approximate with Fraunces + the brand greens.
export default function SalesloftLogo({ className }: { className?: string }) {
  return (
    <div className={`sl-logo ${className ?? ''}`}>
      <span className="sl-logo-mark" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          {/* sprout / growth mark */}
          <path
            d="M12 21V11"
            stroke="#15AE6E"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M12 12c0-3.3-2.7-6-6-6 0 3.3 2.7 6 6 6Z"
            fill="#15AE6E"
          />
          <path
            d="M12 10c0-3 2.4-5.4 5.4-5.4C17.4 7.6 15 10 12 10Z"
            fill="#0C5B43"
          />
        </svg>
      </span>
      <span className="sl-logo-word">salesloft</span>
    </div>
  );
}
