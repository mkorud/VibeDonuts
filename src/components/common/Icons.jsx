/**
 * Ikon SVG inline (stroke-based, 24x24).
 * Dibuat sendiri agar proyek tidak menambah dependensi ikon eksternal.
 *
 * Cara pakai: <IconCart className="h-5 w-5 text-cocoa-700" />
 */

function Svg({ className, strokeWidth = 1.8, children, ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'h-5 w-5'}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* --- Navigasi & aksi dasar --- */

export function IconMenu(props) {
  return (
    <Svg {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </Svg>
  );
}

export function IconClose(props) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

export function IconCart(props) {
  return (
    <Svg {...props}>
      <path d="M2.75 3.5h2l2.3 10.9a1.75 1.75 0 0 0 1.72 1.39h8.4a1.75 1.75 0 0 0 1.71-1.36L20.5 7.2H6.1" />
      <circle cx="9.5" cy="19.5" r="1.5" />
      <circle cx="17" cy="19.5" r="1.5" />
    </Svg>
  );
}

export function IconSearch(props) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.6-3.6" />
    </Svg>
  );
}

export function IconPlus(props) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function IconMinus(props) {
  return (
    <Svg {...props}>
      <path d="M5 12h14" />
    </Svg>
  );
}

export function IconArrowRight(props) {
  return (
    <Svg {...props}>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </Svg>
  );
}

export function IconArrowLeft(props) {
  return (
    <Svg {...props}>
      <path d="M20 12H4M10 6l-6 6 6 6" />
    </Svg>
  );
}

export function IconChevronDown(props) {
  return (
    <Svg {...props}>
      <path d="M6 9.5l6 6 6-6" />
    </Svg>
  );
}

export function IconCheck(props) {
  return (
    <Svg {...props}>
      <path d="M4.5 12.5l5 5 10-11" />
    </Svg>
  );
}

export function IconCheckCircle(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.4l2.4 2.4 4.6-5" />
    </Svg>
  );
}

export function IconAlert(props) {
  return (
    <Svg {...props}>
      <path d="M10.3 3.9L2.6 17.2A1.9 1.9 0 0 0 4.3 20h15.4a1.9 1.9 0 0 0 1.7-2.8L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z" />
      <path d="M12 9v4.5M12 17h.01" />
    </Svg>
  );
}

export function IconInfo(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </Svg>
  );
}

export function IconLoader(props) {
  return (
    <Svg {...props}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </Svg>
  );
}

export function IconHome(props) {
  return (
    <Svg {...props}>
      <path d="M4 10.5L12 4l8 6.5" />
      <path d="M6 9.7V20h12V9.7" />
    </Svg>
  );
}

export function IconUser(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.8 20a7.4 7.4 0 0 1 14.4 0" />
    </Svg>
  );
}

export function IconLogout(props) {
  return (
    <Svg {...props}>
      <path d="M15 4h2.5A2.5 2.5 0 0 1 20 6.5v11A2.5 2.5 0 0 1 17.5 20H15" />
      <path d="M10 8l-4 4 4 4M6 12h9" />
    </Svg>
  );
}

/* --- Ikon dashboard admin --- */

export function IconChart(props) {
  return (
    <Svg {...props}>
      <path d="M4 20h16" />
      <path d="M7 20v-6M12 20V6M17 20v-9" />
    </Svg>
  );
}

export function IconBox(props) {
  return (
    <Svg {...props}>
      <path d="M20.5 8.4v7.2a1.6 1.6 0 0 1-.85 1.42l-6.75 3.5a1.6 1.6 0 0 1-1.42 0l-6.75-3.5A1.6 1.6 0 0 1 3.5 15.6V8.4" />
      <path d="M3.7 7.7l8.3-3.9 8.3 3.9-8.3 4.1Z" />
      <path d="M12 11.8V20" />
    </Svg>
  );
}

export function IconTag(props) {
  return (
    <Svg {...props}>
      <path d="M11.4 3.6H4.9A1.3 1.3 0 0 0 3.6 4.9v6.5c0 .35.14.68.38.92l7.7 7.7a1.3 1.3 0 0 0 1.84 0l6.5-6.5a1.3 1.3 0 0 0 0-1.84l-7.7-7.7a1.3 1.3 0 0 0-.92-.38Z" />
      <circle cx="8" cy="8" r="1.4" />
    </Svg>
  );
}

export function IconReceipt(props) {
  return (
    <Svg {...props}>
      <path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21Z" />
      <path d="M9.5 8h5M9.5 12h5" />
    </Svg>
  );
}

export function IconSettings(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 14.6a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-2.89 1.2 2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.89-1.2l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 3 15.16a2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.2-2.89l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 10 4.24a2 2 0 1 1 4 0 1.7 1.7 0 0 0 2.89 1.2l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0 1.2 2.89 2 2 0 1 1 0 4 1.7 1.7 0 0 0-1.52 1.44Z" />
    </Svg>
  );
}

export function IconStore(props) {
  return (
    <Svg {...props}>
      <path d="M4 9.5V19a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19V9.5" />
      <path d="M3 9.5l1.8-5.2A1.5 1.5 0 0 1 6.2 3.3h11.6a1.5 1.5 0 0 1 1.4 1l1.8 5.2Z" />
      <path d="M9.5 20.5v-6h5v6" />
    </Svg>
  );
}

export function IconTrendUp(props) {
  return (
    <Svg {...props}>
      <path d="M3 17l5.5-5.5 3.5 3.5L20 7" />
      <path d="M15 7h5v5" />
    </Svg>
  );
}

export function IconWallet(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M16.5 14.5h.01" />
    </Svg>
  );
}

export function IconClock(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </Svg>
  );
}

export function IconTruck(props) {
  return (
    <Svg {...props}>
      <path d="M2.5 6.5h10V16h-10Z" />
      <path d="M12.5 9.5h4l3 3v3.5h-7Z" />
      <circle cx="6.5" cy="18" r="1.6" />
      <circle cx="16.5" cy="18" r="1.6" />
    </Svg>
  );
}

/* --- Ikon konten, kontak & dekorasi --- */

export function IconUpload(props) {
  return (
    <Svg {...props}>
      <path d="M12 16V4M8 8l4-4 4 4" />
      <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
    </Svg>
  );
}

export function IconImage(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="M4 17l4.8-4.3a1.6 1.6 0 0 1 2.1 0L20 19.5" />
    </Svg>
  );
}

export function IconTrash(props) {
  return (
    <Svg {...props}>
      <path d="M4 7h16" />
      <path d="M9.5 7V4.8A1.3 1.3 0 0 1 10.8 3.5h2.4A1.3 1.3 0 0 1 14.5 4.8V7" />
      <path d="M6.5 7l.8 12.2a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
      <path d="M10.5 11v6M13.5 11v6" />
    </Svg>
  );
}

export function IconEdit(props) {
  return (
    <Svg {...props}>
      <path d="M15.5 5.2l3.3 3.3L8.6 18.7l-4 .7.7-4Z" />
      <path d="M13.6 7.1l3.3 3.3" />
    </Svg>
  );
}

export function IconLock(props) {
  return (
    <Svg {...props}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </Svg>
  );
}

export function IconRefresh(props) {
  return (
    <Svg {...props}>
      <path d="M20 11.5A8 8 0 0 0 6.3 6.3L4 8.5" />
      <path d="M4 5v3.5H7.5" />
      <path d="M4 12.5a8 8 0 0 0 13.7 5.2L20 15.5" />
      <path d="M20 19v-3.5h-3.5" />
    </Svg>
  );
}

export function IconStar(props) {
  return (
    <Svg {...props}>
      <path d="M12 3.8l2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8Z" />
    </Svg>
  );
}

export function IconSparkles(props) {
  return (
    <Svg {...props}>
      <path d="M12 4l1.6 4L18 9.6l-4.4 1.6L12 15.6l-1.6-4.4L6 9.6 10.4 8Z" />
      <path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7Z" />
    </Svg>
  );
}

export function IconWhatsapp(props) {
  return (
    <Svg {...props}>
      <path d="M3.5 20.5l1.4-4.2A8.5 8.5 0 1 1 8 19.2Z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1-.5 1-1l-.3-1-1.4-.5-.8.8a4.6 4.6 0 0 1-1.8-1.8l.8-.8-.5-1.4-1-.3c-.5 0-1 .4-1 1Z" />
    </Svg>
  );
}

export function IconMapPin(props) {
  return (
    <Svg {...props}>
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </Svg>
  );
}

export function IconPhone(props) {
  return (
    <Svg {...props}>
      <path d="M6.5 3.5h2.2l1.6 4-2 1.3a11 11 0 0 0 5.9 5.9l1.3-2 4 1.6v2.2a2.5 2.5 0 0 1-2.7 2.5C10.6 18.4 5.6 13.4 4 6.2A2.5 2.5 0 0 1 6.5 3.5Z" />
    </Svg>
  );
}

export function IconMail(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M4 7.5l8 5 8-5" />
    </Svg>
  );
}

export function IconHeart(props) {
  return (
    <Svg {...props}>
      <path d="M12 20s-7.5-4.4-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6c0 5-7.5 9.4-7.5 9.4Z" />
    </Svg>
  );
}

export function IconAward(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="9.5" r="5.5" />
      <path d="M8.8 14.2L7.5 21l4.5-2.4L16.5 21l-1.3-6.8" />
    </Svg>
  );
}
