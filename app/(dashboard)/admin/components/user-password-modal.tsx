'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { PasswordInput } from "@/components/ui/password-input"
import { type UserShown } from "../datahooks/useUserAdminList"

const schema = z.object({
  newPassword: z
    .string()
    .min(8, "Password minimal 8 karakter"),
})

type FormValues = z.infer<typeof schema>

type Props = {
  user: UserShown
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserPasswordModal({ user, open, onOpenChange }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "" },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: FormValues) {
    const { error } = await authClient.admin.setUserPassword({
      userId: user.id,
      newPassword: values.newPassword,
    })

    if (error) {
      toast.error(error.message ?? "Gagal mengatur password")
      return
    }

    toast.success("Password berhasil diatur ulang")
    form.reset()
    onOpenChange(false)
  }

  function handleOpenChange(v: boolean) {
    if (!v) form.reset()
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atur Password</DialogTitle>
          <DialogDescription>
            Atur password baru untuk pengguna{" "}
            <strong>{user.name}</strong>. Pengguna akan diminta masuk ulang
            setelah password diubah.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Baru</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Minimal 8 karakter" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan Password"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
