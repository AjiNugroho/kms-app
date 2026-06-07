'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useChildById } from "../datahooks/useChildDetail"

function calcAgeMonths(bornDate: string): number {
  const born = new Date(bornDate)
  const today = new Date()
  let months =
    (today.getFullYear() - born.getFullYear()) * 12 +
    (today.getMonth() - born.getMonth())
  if (today.getDate() < born.getDate()) months--
  return Math.max(0, months)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

type InfoRowProps = { label: string; value: React.ReactNode }

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

type Props = { childId: string }

export function ChildInfoCard({ childId }: Props) {
  const { data, isLoading, isError } = useChildById(childId)

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6 text-destructive text-sm">
          Gagal memuat data anak.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isLoading ? <Skeleton className="h-6 w-48" /> : data?.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : data ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            <InfoRow label="Jenis Kelamin" value={data.gender === "laki-laki" ? "Laki-laki" : "Perempuan"} />
            <InfoRow label="Tanggal Lahir" value={formatDate(data.bornDate)} />
            <InfoRow label="Usia" value={`${calcAgeMonths(data.bornDate)} bulan`} />
            <InfoRow label="Nama Ayah" value={data.fatherName} />
            <InfoRow label="Nama Ibu" value={data.motherName} />
            <InfoRow label="Alamat" value={data.address} />
            <InfoRow label="Berat Lahir" value={`${parseFloat(data.bornWeight).toFixed(2)} kg`} />
            <InfoRow label="Panjang Lahir" value={`${parseFloat(data.bornLength).toFixed(1)} cm`} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
