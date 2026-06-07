'use client'

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import { type ImmunizationRecord, useUpdateImmunization } from "../datahooks/useChildDetail"

const schema = z.object({
  type: z.enum(["vitamin", "vaksin"], { error: "Jenis wajib dipilih" }),
  name: z.string().min(1, "Nama wajib diisi"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  note: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

type Props = {
  childId: string
  record: ImmunizationRecord
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImmunizationEditModal({ childId, record, open, onOpenChange }: Props) {
  const update = useUpdateImmunization(childId)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: record.type,
      name: record.name,
      date: record.date,
      note: record.note ?? "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        type: record.type,
        name: record.name,
        date: record.date,
        note: record.note ?? "",
      })
    }
  }, [open, record, form])

  async function onSubmit(values: FormValues) {
    try {
      await update.mutateAsync({ immuId: record.id, ...values })
      toast.success("Data berhasil diperbarui")
      onOpenChange(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal memperbarui data")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Riwayat</DialogTitle>
          <DialogDescription>
            Perbarui data <strong>{record.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="vitamin">Vitamin</SelectItem>
                        <SelectItem value="vaksin">Vaksin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Input placeholder="Opsional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
