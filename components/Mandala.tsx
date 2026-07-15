// A generated copper mandala — no external image asset required.
// Purely decorative; hidden from assistive tech.
export function Mandala({
  className = "",
  spin = false,
}: {
  className?: string;
  spin?: boolean;
}) {
  const petals = Array.from({ length: 12 });
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${className} ${spin ? "animate-spin-slow" : ""}`}
      aria-hidden="true"
      role="presentation"
    >
      <g fill="none" stroke="currentColor" strokeWidth="0.75">
        <circle cx="100" cy="100" r="96" strokeOpacity="0.35" />
        <circle cx="100" cy="100" r="78" strokeOpacity="0.5" />
        <circle cx="100" cy="100" r="42" strokeOpacity="0.6" />
        <circle cx="100" cy="100" r="14" strokeOpacity="0.9" />
        {petals.map((_, i) => (
          <g key={i} transform={`rotate(${(360 / petals.length) * i} 100 100)`}>
            <path
              d="M100 22 C118 52, 118 78, 100 100 C82 78, 82 52, 100 22 Z"
              strokeOpacity="0.7"
            />
            <line x1="100" y1="14" x2="100" y2="42" strokeOpacity="0.4" />
          </g>
        ))}
        {petals.map((_, i) => (
          <g
            key={`inner-${i}`}
            transform={`rotate(${(360 / petals.length) * i + 15} 100 100)`}
          >
            <path
              d="M100 58 C110 74, 110 88, 100 100 C90 88, 90 74, 100 58 Z"
              strokeOpacity="0.55"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
