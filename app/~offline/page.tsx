export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <p className="text-5xl">📵</p>
      <h1 className="text-xl font-semibold">Tidak Ada Koneksi</h1>
      <p className="text-sm text-muted-foreground">
        Periksa koneksi internet Anda dan coba lagi.
      </p>
    </div>
  )
}
