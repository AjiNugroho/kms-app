"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { SearchIcon, XIcon, CheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// ── Types ─────────────────────────────────────────────────────────────────────

type ChildResult = {
  id: string
  name: string
  fatherName: string
  motherName: string
}

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  month: z
    .string()
    .min(1, "Bulan wajib diisi")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 1, "Bulan minimal 1"),
  weight: z.string().optional(),
  length: z.string().optional(),
  headCircumference: z.string().optional(),
  note: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

// ── Child searchable select ───────────────────────────────────────────────────

function ChildSelect({
  value,
  onChange,
}: {
  value: ChildResult | null
  onChange: (child: ChildResult | null) => void
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ChildResult[]>([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (timerRef.current) clearTimeout(timerRef.current)

    if (!val.trim()) {
      setResults([])
      setOpen(false)
      setSearching(false)
      return
    }

    setSearching(true)
    setOpen(true)
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/children?search=${encodeURIComponent(val.trim())}`)
        const data: ChildResult[] = await res.json()
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 800)
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
        <div className="flex items-center gap-2">
          <CheckIcon className="size-4 shrink-0 text-emerald-500" />
          <div>
            <p className="text-sm font-medium">{value.name}</p>
            <p className="text-xs text-muted-foreground">
              {value.fatherName} / {value.motherName}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Ketik nama anak..."
          value={query}
          onChange={handleQueryChange}
          className="pl-9"
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border bg-popover shadow-md">
          {searching ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">Mencari...</p>
          ) : results.length > 0 ? (
            <ul className="max-h-56 overflow-y-auto">
              {results.map((child) => (
                <li key={child.id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                    onClick={() => {
                      onChange(child)
                      setQuery("")
                      setOpen(false)
                    }}
                  >
                    <span className="font-medium">{child.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {child.fatherName} / {child.motherName}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2 text-sm text-muted-foreground">Anak tidak ditemukan</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────

export function GrowthInputForm() {
  const [selectedChild, setSelectedChild] = useState<ChildResult | null>(null)
  const [childError, setChildError] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      month: "",
      weight: "",
      length: "",
      headCircumference: "",
      note: "",
    },
  })

  async function onSubmit(values: FormValues) {
    if (!selectedChild) {
      setChildError(true)
      return
    }
    setChildError(false)

    const payload = {
      month: Number(values.month),
      weight: values.weight || null,
      length: values.length || null,
      headCircumference: values.headCircumference || null,
      note: values.note || null,
    }

    try {
      const res = await fetch(`/api/children/${selectedChild.id}/growth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err?.error?.formErrors?.[0] ?? "Gagal menyimpan data")
        return
      }

      toast.success(`Data bulan ${values.month} untuk ${selectedChild.name} berhasil disimpan`)
      form.reset()
      setSelectedChild(null)
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.")
    }
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Input Data Tumbuh Kembang</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* Child select */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none">
                Nama Anak <span className="text-destructive">*</span>
              </label>
              <ChildSelect
                value={selectedChild}
                onChange={(c) => {
                  setSelectedChild(c)
                  if (c) setChildError(false)
                }}
              />
              {childError && (
                <p className="text-xs text-destructive">Pilih anak terlebih dahulu</p>
              )}
            </div>

            {/* Month */}
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Bulan ke- <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" min={1} placeholder="cth. 6" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Measurements */}
            <div>
              <p className="mb-2 text-sm font-medium">
                Pengukuran{" "}
                <span className="text-xs font-normal text-muted-foreground">(opsional)</span>
              </p>
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">BB (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">TB (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="0.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="headCircumference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">LK (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="0.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Note */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Catatan{" "}
                    <span className="text-xs font-normal text-muted-foreground">(opsional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tambahkan catatan..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
