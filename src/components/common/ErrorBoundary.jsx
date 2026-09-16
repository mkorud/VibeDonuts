import { Component } from 'react';
import { Button } from './Button';
import { IconAlert } from './Icons';

/**
 * Penjaga error tingkat aplikasi.
 * Bila ada komponen yang gagal render, layar tidak menjadi putih total -
 * pengguna melihat pesan ramah, dan detail error tampil di konsol (dev mode).
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Di produksi, kirim ke layanan pelacak error (Sentry/dll).
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;

    if (error) {
      return (
        <div className="container-page flex min-h-screen flex-col items-center justify-center gap-4 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <IconAlert className="h-7 w-7" />
          </span>

          <h1 className="text-2xl font-extrabold">Ups, terjadi kesalahan</h1>
          <p className="max-w-md text-sm leading-relaxed text-cocoa-500">
            Ada bagian aplikasi yang gagal ditampilkan. Coba muat ulang halaman ini. Jika masih
            muncul, hubungi pemilik toko.
          </p>

          <pre className="max-w-full overflow-x-auto rounded-xl bg-cocoa-900 p-4 text-left text-xs text-cream-100">
            {String(error?.message ?? error)}
          </pre>

          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Muat Ulang Halaman
            </Button>
            <Button variant="secondary" to="/">
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
