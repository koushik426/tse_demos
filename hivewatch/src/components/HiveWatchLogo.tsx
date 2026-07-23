// HiveWatch hexagon mark + wordmark.
export default function HiveWatchLogo({ wordmark = true }: { wordmark?: boolean }) {
  return (
    <div className="hw-logo">
      <svg className="hw-logo-mark" width="26" height="28" viewBox="0 0 26 28" aria-hidden>
        <path
          d="M13 1.5 24 7.75v12.5L13 26.5 2 20.25V7.75L13 1.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M13 8.5 18 11.4v5.7L13 20l-5-2.9v-5.7L13 8.5Z"
          fill="currentColor"
        />
      </svg>
      {wordmark && <span className="hw-logo-word">HIVEWATCH</span>}
    </div>
  );
}
