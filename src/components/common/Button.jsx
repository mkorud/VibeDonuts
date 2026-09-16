import { Link } from 'react-router-dom';

/**
 * Tombol standar VibeDonuts (PRD 3.2: "Button - tombol standar utama, sekunder, nonaktif").
 *
 * Mendukung tiga bentuk elemen:
 *  - default            -> <button>
 *  - props `to`         -> <Link> react-router
 *  - props `href`       -> <a> (tautan luar, mis. WhatsApp)
 */

const VARIANTS = {
  primary:
    'bg-cocoa-700 text-cream-50 shadow-soft hover:bg-cocoa-800 active:bg-cocoa-900 disabled:bg-cocoa-300',
  secondary:
    'bg-white text-cocoa-700 ring-1 ring-cocoa-200 hover:bg-cocoa-50 active:bg-cocoa-100 disabled:text-cocoa-300',
  blush: 'bg-blush-500 text-white shadow-soft hover:bg-blush-600 active:bg-blush-600 disabled:bg-blush-200',
  ghost: 'bg-transparent text-cocoa-700 hover:bg-cocoa-100 disabled:text-cocoa-300',
  danger: 'bg-rose-600 text-white shadow-soft hover:bg-rose-700 disabled:bg-rose-300',
  dark: 'bg-cocoa-900 text-cream-50 shadow-soft hover:bg-cocoa-800 disabled:bg-cocoa-400',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-sm gap-2 sm:text-base',
};

function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  to,
  href,
  onClick,
  disabled = false,
  isLoading = false,
  iconLeft = null,
  iconRight = null,
  fullWidth = false,
  className = '',
  ...rest
}) {
  const isDisabled = disabled || isLoading;
  const classes = [
    'inline-flex items-center justify-center rounded-full font-semibold transition',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:cursor-not-allowed disabled:shadow-none',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {isLoading ? <Spinner /> : iconLeft}
      {children}
      {!isLoading && iconRight}
    </>
  );

  if (to && !isDisabled) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href && !isDisabled) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={classes}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
}
