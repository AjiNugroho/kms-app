'use client'

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type UserShown } from "../datahooks/useUserAdminList"

const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.email("Format email tidak valid"),
  role: z.enum(["kader", "normaluser"]),
})

type FormValues = z.infer<typeof schema>

type Props = {
  user: UserShown
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserEditModal({ user, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormValues, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role as FormValues["role"],
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: user.name,
        email: user.email,
        role: user.role as FormValues["role"],
      })
    }
  }, [open, user, form])

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: FormValues) {
    const [updateResult, roleResult] = await Promise.all([
      authClient.admin.updateUser({
        userId: user.id,
        data: { name: values.name, email: values.email },
      }),
      values.role !== user.role
        ? authClient.admin.setRole({ userId: user.id, role: values.role })
        : Promise.resolve({ error: null }),
    ])

    const error = updateResult.error ?? roleResult.error
    if (error) {
      toast.error(error.message ?? "Gagal memperbarui pengguna")
      return
    }

    toast.success("Data pengguna berhasil diperbarui")
    queryClient.invalidateQueries({ queryKey: ["admin-user-list"] })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Pengguna</DialogTitle>
          <DialogDescription>
            Perbarui data pengguna <strong>{user.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contoh@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peran</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih peran" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="kader">Kader</SelectItem>
                      <SelectItem value="normaluser">Normal User</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
