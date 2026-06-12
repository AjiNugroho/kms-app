"use client"

import { useState, useEffect, useRef } from "react"
import { DownloadIcon, BookOpenIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Render the first page of a PDF into a <canvas> element
function PdfThumbnail({ href }: { href: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading")

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist")
        GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

        const pdf = await getDocument({ url: href }).promise
        if (cancelled) return

        const page = await pdf.getPage(1)
        if (cancelled) return

        const canvas = canvasRef.current
        if (!canvas) return

        // Scale to fill the card width (canvas is 100% wide via CSS)
        const viewport = page.getViewport({ scale: 1 })
        const targetWidth = canvas.offsetWidth || 240
        const scale = targetWidth / viewport.width
        const scaled = page.getViewport({ scale })

        canvas.width = scaled.width
        canvas.height = scaled.height

        await page.render({ canvas, viewport: scaled }).promise
        if (!cancelled) setStatus("done")
      } catch {
        if (!cancelled) setStatus("error")
      }
    }

    render()
    return () => { cancelled = true }
  }, [href])

  if (status === "error") {
    return (
      <div className="flex h-40 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
        Pratinjau tidak tersedia
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-md border bg-white">
      {status === "loading" && (
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
      )}
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ display: status === "done" ? "block" : "block", opacity: status === "done" ? 1 : 0 }}
      />
    </div>
  )
}

export function PdfList({ files }: { files: string[] }) {
  const [viewing, setViewing] = useState<string | null>(null)

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((name) => {
          const href = `/pdf/${encodeURIComponent(name)}`
          return (
            <Card key={name} className="flex flex-col overflow-hidden">
              {/* Cover thumbnail */}
              <div className="px-4 pt-4">
                <PdfThumbnail href={href} />
              </div>

              <CardContent className="flex flex-1 flex-col gap-3 pt-3">
                <p className="text-sm font-medium leading-snug line-clamp-2">
                  {name.replace(/\.pdf$/i, "")}
                </p>

                <div className="mt-auto flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setViewing(name)}
                  >
                    <BookOpenIcon className="mr-1.5 size-3.5" />
                    Baca
                  </Button>
                  <Button size="sm" className="flex-1" asChild>
                    <a href={href} download={name}>
                      <DownloadIcon className="mr-1.5 size-3.5" />
                      Unduh
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Viewer modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
            <p className="truncate text-sm font-medium">{viewing.replace(/\.pdf$/i, "")}</p>
            <div className="flex items-center gap-2">
              <Button size="sm" asChild>
                <a href={`/pdf/${encodeURIComponent(viewing)}`} download={viewing}>
                  <DownloadIcon className="mr-1.5 size-3.5" />
                  Unduh
                </a>
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setViewing(null)}>
                <XIcon className="size-4" />
              </Button>
            </div>
          </div>

          <iframe
            src={`/pdf/${encodeURIComponent(viewing)}`}
            className="min-h-0 flex-1 w-full border-0"
            title={viewing}
          />
        </div>
      )}
    </>
  )
}
