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
import { type Child, useUpdateChild } from "../datahooks/useChildren"

const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  bornDate: z.string().min(1, "Tanggal lahir wajib diisi"),
  gender: z.enum(["laki-laki", "perempuan"], { error: "Jenis kelamin wajib dipilih" }),
  fatherName: z.string().min(1, "Nama ayah wajib diisi"),
  motherName: z.string().min(1, "Nama ibu wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  bornWeight: z
    .string()
    .min(1, "Berat lahir wajib diisi")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Harus berupa angka positif"),
  bornLength: z
    .string()
    .min(1, "Panjang lahir wajib diisi")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Harus berupa angka positif"),
  bornCircumference: z
    .string()
    .min(1, "Lingkar kepala lahir wajib diisi")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Harus berupa angka positif"),
})

type FormValues = z.infer<typeof schema>

type Props = {
  child: Child
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChildEditModal({ child, open, onOpenChange }: Props) {
  const updateChild = useUpdateChild()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: child.name,
      bornDate: child.bornDate,
      gender: child.gender,
      fatherName: child.fatherName,
      motherName: child.motherName,
      address: child.address,
      bornWeight: child.bornWeight,
      bornLength: child.bornLength,
      bornCircumference: child.bornCircumference,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: child.name,
        bornDate: child.bornDate,
        gender: child.gender,
        fatherName: child.fatherName,
        motherName: child.motherName,
        address: child.address,
        bornWeight: child.bornWeight,
        bornLength: child.bornLength,
        bornCircumference: child.bornCircumference,
      })
    }
  }, [open, child, form])

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: FormValues) {
    try {
      await updateChild.mutateAsync({ id: child.id, ...values })
      toast.success("Data anak berhasil diperbarui")
      onOpenChange(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal memperbarui data")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Data Anak</DialogTitle>
          <DialogDescription>
            Perbarui data <strong>{child.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Anak</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama lengkap anak" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bornDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Lahir</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Kelamin</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="laki-laki">Laki-laki</SelectItem>
                        <SelectItem value="perempuan">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fatherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Ayah</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama ayah" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="motherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Ibu</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama ibu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Input placeholder="Alamat lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="bornWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Berat Lahir (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="3.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bornLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Panjang Lahir (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" min="0" placeholder="50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bornCircumference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LK Lahir (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" min="0" placeholder="33" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
