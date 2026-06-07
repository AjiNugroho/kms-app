'use client'

import { useRef, useState } from "react"
import { UploadIcon, DownloadIcon, FileSpreadsheetIcon } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useBulkImportChildren } from "../datahooks/useChildren"

const TEMPLATE_COLUMNS = [
  "Nama",
  "Tanggal Lahir",
  "Jenis Kelamin",
  "Nama Ayah",
  "Nama Ibu",
  "Alamat",
  "Berat Lahir (kg)",
  "Panjang Lahir (cm)",
  "Lingkar Kepala Lahir (cm)",
]

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    TEMPLATE_COLUMNS,
    ["Budi Santoso", "2023-01-15", "laki-laki", "Andi Santoso", "Siti Rahayu", "Jl. Merdeka No. 1", "3.5", "50", "33"],
  ])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Data Anak")
  XLSX.writeFile(wb, "template-data-anak.xlsx")
}

export function ChildBulkModal() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const bulkImport = useBulkImportChildren()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null)
  }

  async function handleImport() {
    if (!file) return
    try {
      const result = await bulkImport.mutateAsync(file)
      toast.success(`${result.inserted} data anak berhasil diimpor`)
      setFile(null)
      if (fileRef.current) fileRef.current.value = ""
      setOpen(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal mengimpor data")
    }
  }

  function handleOpenChange(v: boolean) {
    if (!v) {
      setFile(null)
      if (fileRef.current) fileRef.current.value = ""
    }
    setOpen(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <UploadIcon />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Data Anak dari Excel</DialogTitle>
          <DialogDescription>
            Unggah file Excel sesuai format template. Data yang sudah ada akan dilewati.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button variant="outline" size="sm" onClick={downloadTemplate} type="button">
            <DownloadIcon />
            Unduh Template
          </Button>

          <div className="rounded-md border border-dashed p-6 text-center">
            <FileSpreadsheetIcon className="mx-auto mb-2 size-8 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              Pilih file <span className="font-medium">.xlsx</span> atau <span className="font-medium">.xls</span>
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="bulk-file-input"
            />
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => fileRef.current?.click()}
            >
              Pilih File
            </Button>
            {file && (
              <p className="mt-2 text-sm font-medium text-foreground">{file.name}</p>
            )}
          </div>

          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Kolom yang diperlukan:</p>
            {TEMPLATE_COLUMNS.map((col) => (
              <p key={col}>• {col}</p>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleImport}
            disabled={!file || bulkImport.isPending}
          >
            {bulkImport.isPending ? "Mengimpor..." : "Impor Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
