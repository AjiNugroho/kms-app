'use client'

import { useState } from "react"
import { TriangleAlertIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { type ImmunizationRecord, useDeleteImmunization } from "../datahooks/useChildDetail"

type Props = {
  childId: string
  record: ImmunizationRecord
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImmunizationDeleteModal({ childId, record, open, onOpenChange }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const deleteImmu = useDeleteImmunization(childId)

  async function handleDelete() {
    setIsSubmitting(true)
    try {
      await deleteImmu.mutateAsync(record.id)
      toast.success("Data berhasil dihapus")
      onOpenChange(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus data")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <TriangleAlertIcon className="size-5 shrink-0" />
            <DialogTitle className="text-destructive">Hapus Riwayat</DialogTitle>
          </div>
          <DialogDescription>
            Hapus data <strong className="text-foreground">{record.name}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
            {isSubmitting ? "Menghapus..." : "Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
