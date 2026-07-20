interface Props {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 22, className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="lm-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6cc4ff" />
          <stop offset="55%" stopColor="#8affea" />
          <stop offset="100%" stopColor="#caa9ff" />
        </linearGradient>
        <radialGradient id="lm-spark" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={1} />
          <stop offset="55%" stopColor="#8affea" stopOpacity={0.85} />
          <stop offset="100%" stopColor="#8affea" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle
        cx="32"
        cy="32"
        r="19"
        fill="none"
        stroke="url(#lm-grad)"
        strokeWidth="2.4"
        opacity={0.55}
      />
      <circle
        cx="32"
        cy="32"
        r="13"
        fill="none"
        stroke="url(#lm-grad)"
        strokeWidth="1.6"
        opacity={0.35}
      />
      <path d="M 12 12 L 52 52" stroke="url(#lm-grad)" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M 52 12 L 12 52" stroke="url(#lm-grad)" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="32" cy="32" r="7" fill="url(#lm-spark)" />
    </svg>
  );
}
