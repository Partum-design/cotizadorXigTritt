import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function MixerIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="8" width="6" height="5" rx="1" />
      <path d="M9 13v3" />
      <path d="M12 16h18a3 3 0 0 1 3 3v13a5 5 0 0 1-5 5H14a5 5 0 0 1-5-5V19a3 3 0 0 1 3-3Z" />
      <path d="M9 22c4 3 6-3 10 0s6-3 10 0" />
      <path d="M9 29c4 3 6-3 10 0s6-3 10 0" />
      <path d="M20 37v3M28 37v3" />
    </svg>
  );
}

export function GrinderIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M10 8h28l-6 12H16Z" />
      <path d="M16 20v6l4 4v9" />
      <path d="M32 20v6l-4 4v9" />
      <circle cx="20" cy="41" r="2.4" />
      <circle cx="28" cy="41" r="2.4" />
      <path d="M6 12h4M38 12h4M8 16h3M37 16h3" />
    </svg>
  );
}

export function TankIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M10 12a14 3 0 0 1 28 0v20a14 3 0 0 1-28 0Z" />
      <path d="M10 12a14 3 0 0 0 28 0" />
      <path d="M14 38l-2 5M34 38l2 5" />
      <path d="M24 32v8" />
    </svg>
  );
}

export function KettleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 18a15 5 0 0 1 30 0v10a15 5 0 0 1-30 0Z" />
      <path d="M9 18a15 5 0 0 0 30 0" />
      <path d="M14 33l-2 6M34 33l2 6" />
      <path d="M24 8v3M20 5c0 2 4 2 4 4M28 5c0 2-4 2-4 4" />
    </svg>
  );
}

export function SieveIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="8" y="8" width="32" height="7" rx="1.5" />
      <path d="M11 15l3 7h20l3-7" />
      <rect x="12" y="22" width="24" height="6" rx="1.5" />
      <path d="M16 28l2 6h12l2-6" />
      <rect x="18" y="34" width="12" height="5" rx="1.5" />
      <path d="M13 11h2M18 11h2M23 11h2M28 11h2M33 11h2" strokeWidth="1.2" />
    </svg>
  );
}

export function DisperserIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="9" y="18" width="30" height="21" rx="2" />
      <path d="M24 6v24" />
      <path d="M15 9h18" strokeWidth="2.4" />
      <path d="M18 27c2 3 10 3 12 0" />
      <path d="M14 34h20" strokeDasharray="2 3" />
    </svg>
  );
}

export const CATEGORY_ICONS: Record<string, (props: IconProps) => React.JSX.Element> = {
  mixer: MixerIcon,
  grinder: GrinderIcon,
  tank: TankIcon,
  kettle: KettleIcon,
  sieve: SieveIcon,
  disperser: DisperserIcon,
};

export function ProductIcon({ icon, ...props }: { icon: string } & IconProps) {
  const Cmp = CATEGORY_ICONS[icon] ?? MixerIcon;
  return <Cmp {...props} />;
}
