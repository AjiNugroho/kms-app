'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

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
import { useCreateImmunization } from "../datahooks/useChildDetail"

const schema = z.object({
  type: z.enum(["vitamin", "vaksin", "obat"], { error: "Jenis wajib dipilih" }),
  name: z.string().min(1, "Nama wajib diisi"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  note: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

type Props = { childId: string }

export function ImmunizationCreateModal({ childId }: Props) {
  const [open, setOpen] = useState(false)
  const create = useCreateImmunization(childId)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "vaksin", name: "", date: "", note: "" },
  })

  async function onSubmit(values: FormValues) {
    try {
      await create.mutateAsync(values)
      toast.success("Data berhasil disimpan")
      form.reset()
      setOpen(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan data")
    }
  }

  function handleOpenChange(v: boolean) {
    if (!v) form.reset()
    setOpen(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          Tambah
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Riwayat Vitamin / Imunisasi</DialogTitle>
          <DialogDescription>Catat pemberian vitamin atau vaksin.</DialogDescription>
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
                          <SelectValue placeholder="Pilih jenis" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="vitamin">Vitamin</SelectItem>
                        <SelectItem value="vaksin">Vaksin</SelectItem>
                        <SelectItem value="obat">Obat</SelectItem>
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
                    <Input placeholder="cth. Vitamin A, BCG, DPT-HB-Hib" {...field} />
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
                {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
