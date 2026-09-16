import { useState } from 'react';
import { DECOR_IMAGES } from '../../data/seed';

/**
 * Foto produk dengan cadangan otomatis.
 * Bila URL foto rusak / kosong, tampilkan foto donat default agar tata letak tidak pecah.
 */
export function ProductImage({ src, alt = 'Foto produk', className = '', wrapperClassName = '' }) {
  const [hasError, setHasError] = useState(false);
  const finalSrc = !src || hasError ? DECOR_IMAGES.fallbackProduct : src;

  return (
    <span className={`block overflow-hidden bg-cocoa-100 ${wrapperClassName}`}>
      <img
        src={finalSrc}
        alt={alt}
        loading="lazy"
        onError={() => setHasError(true)}
        className={className}
      />
    </span>
  );
}