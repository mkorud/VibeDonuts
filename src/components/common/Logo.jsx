import { Link } from 'react-router-dom';

/**
 * Logo VibeDonuts: ikon donat + wordmark.
 * Dipakai di Navbar, Footer, sidebar admin, dan halaman login admin.
 */
export function Logo({
  to = '/',
  size = 'md',
  variant = 'default',
  showTagline = false,
  className = '',
}) {
  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const wordColor = variant === 'light' ? 'text-cream-50' : 'text-cocoa-900';
  const taglineColor = variant === 'light' ? 'text-cream-200' : 'text-cocoa-400';

  return (
    <Link to={to} className={`group flex items-center gap-2.5 ${className}`}>
      <span
        className={`${iconSizes[size]} flex shrink-0 items-center justify-center rounded-2xl bg-blush-100 ring-1 ring-blush-200 transition group-hover:rotate-6`}
      >
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
          <circle cx="16" cy="17" r="10" fill="#774F2F" />
          <circle cx="16" cy="17" r="6.4" fill="#FFE7DF" />
          <circle cx="16" cy="17" r="2.6" fill="#FFF8EE" />
          <circle cx="22.5" cy="7.5" r="1.6" fill="#EF6F51" />
          <circle cx="25.5" cy="11" r="1.1" fill="#FBCC4F" />
          <circle cx="19.5" cy="5" r="1.1" fill="#FB9075" />
        </svg>
      </span>

      <span className="flex flex-col leading-none">
        <span className={`font-display font-extrabold tracking-tight ${textSizes[size]} ${wordColor}`}>
          Vibe<span className="text-blush-500">Donuts</span>
        </span>
        {showTagline ? (
          <span className={`mt-1 text-[11px] font-medium ${taglineColor}`}>
            Donat Premium Handmade
          </span>
        ) : null}
      </span>
    </Link>
  );
}
