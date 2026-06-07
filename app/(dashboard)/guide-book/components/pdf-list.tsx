"use client"

import { useState } from "react"
import { FileTextIcon, DownloadIcon, BookOpenIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function PdfList({ files }: { files: string[] }) {
  const [viewing, setViewing] = useState<string | null>(null)

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((name) => {
          const href = `/pdf/${encodeURIComponent(name)}`
          return (
            <Card key={name} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-4 pt-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950">
                    <FileTextIcon className="size-5 text-red-500" />
                  </div>
                  <p className="text-sm font-medium leading-snug">{name.replace(/\.pdf$/i, "")}</p>
                </div>

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
          {/* Header */}
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

          {/* iframe */}
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
