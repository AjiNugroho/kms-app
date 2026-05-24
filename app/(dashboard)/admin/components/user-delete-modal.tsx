'use client'

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { TriangleAlertIcon } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type UserShown } from "../datahooks/useUserAdminList"

type Props = {
  user: UserShown
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDeleteModal({ user, open, onOpenChange }: Props) {
  const [confirmName, setConfirmName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const isMatch = confirmName === user.name

  async function handleDelete() {
    if (!isMatch) return
    setIsSubmitting(true)

    const { error } = await authClient.admin.removeUser({ userId: user.id })
    setIsSubmitting(false)

    if (error) {
      toast.error(error.message ?? "Gagal menghapus pengguna")
      return
    }

    toast.success("Pengguna berhasil dihapus")
    queryClient.invalidateQueries({ queryKey: ["admin-user-list"] })
    setConfirmName("")
    onOpenChange(false)
  }

  function handleOpenChange(v: boolean) {
    if (!v) setConfirmName("")
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <TriangleAlertIcon className="size-5 shrink-0" />
            <DialogTitle className="text-destructive">Hapus Pengguna</DialogTitle>
          </div>
          <DialogDescription>
            Tindakan ini <strong className="text-foreground">tidak dapat dibatalkan</strong>.
            Akun <strong className="text-foreground">{user.name}</strong> akan dihapus
            secara permanen beserta seluruh sesi aktifnya.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="confirm-name">
            Ketik{" "}
            <span className="font-semibold text-foreground">{user.name}</span>{" "}
            untuk mengonfirmasi penghapusan
          </Label>
          <Input
            id="confirm-name"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={user.name}
            autoComplete="off"
          />
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            disabled={!isMatch || isSubmitting}
            onClick={handleDelete}
          >
            {isSubmitting ? "Menghapus..." : "Hapus Pengguna"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
