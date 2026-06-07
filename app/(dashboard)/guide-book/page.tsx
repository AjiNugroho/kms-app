import { readdirSync } from "fs"
import { join } from "path"
import { PdfList } from "./components/pdf-list"

function getPdfFiles(): string[] {
  const dir = join(process.cwd(), "public", "pdf")
  try {
    return readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith(".pdf"))
      .sort()
  } catch {
    return []
  }
}

export default function GuideBookPage() {
  const files = getPdfFiles()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Buku Panduan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Panduan dan referensi untuk kader posyandu.
        </p>
      </div>

      {files.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada dokumen tersedia.</p>
      ) : (
        <PdfList files={files} />
      )}
    </div>
  )
}
