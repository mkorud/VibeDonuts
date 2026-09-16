import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { IconArrowLeft } from '../../components/common/Icons';

/** Halaman 404 untuk tautan yang tidak dikenal. */
export function NotFoundPage() {
  return (
    <div className="container-page py-20">
      <EmptyState
        icon={<span className="font-display text-2xl font-extrabold">404</span>}
        title="Halaman tidak ditemukan"
        description="Tautan yang Anda buka mungkin salah atau halamannya sudah dipindahkan."
        action={
          <Button to="/" iconLeft={<IconArrowLeft className="h-4 w-4" />}>
            Kembali ke Beranda
          </Button>
        }
      />
    </div>
  );
}
