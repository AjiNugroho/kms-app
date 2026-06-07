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
import { type Child, useDeleteChild } from "../datahooks/useChildren"

type Props = {
  child: Child
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChildDeleteModal({ child, open, onOpenChange }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const deleteChild = useDeleteChild()

  async function handleDelete() {
    setIsSubmitting(true)
    try {
      await deleteChild.mutateAsync(child.id)
      toast.success("Data anak berhasil dihapus")
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
            <DialogTitle className="text-destructive">Hapus Data Anak</DialogTitle>
          </div>
          <DialogDescription>
            Tindakan ini <strong className="text-foreground">tidak dapat dibatalkan</strong>.
            Data anak <strong className="text-foreground">{child.name}</strong> akan dihapus
            secara permanen.
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
