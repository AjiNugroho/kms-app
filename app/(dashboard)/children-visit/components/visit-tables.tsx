"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangleIcon, TrendingDownIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type BgmChild = {
  id: string
  name: string
  gender: string
  fatherName: string
  motherName: string
  ageMonths: number
  lastWeight: number
  threshold: number
}

export type NoIncreaseChild = {
  id: string
  name: string
  gender: string
  fatherName: string
  motherName: string
  prevMonth: number
  prevWeight: number
  lastMonth: number
  lastWeight: number
}

function EmptyRow({ message }: { message: string }) {
  return (
    <TableRow>
      <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
        {message}
      </TableCell>
    </TableRow>
  )
}

function GenderBadge({ gender }: { gender: string }) {
  return (
    <Badge variant={gender === "laki-laki" ? "default" : "secondary"} className="text-xs">
      {gender === "laki-laki" ? "L" : "P"}
    </Badge>
  )
}

function BgmTable({ data }: { data: BgmChild[] }) {
  const router = useRouter()
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Anak</TableHead>
          <TableHead>Orang Tua</TableHead>
          <TableHead className="text-center">L/P</TableHead>
          <TableHead className="text-center">Usia (bln)</TableHead>
          <TableHead className="text-center">BB Terakhir</TableHead>
          <TableHead className="text-center">Batas WHO -3SD</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <EmptyRow message="Tidak ada anak dengan berat di bawah -3 SD WHO." />
        ) : (
          data.map((c) => (
            <TableRow
              key={c.id}
              className="cursor-pointer"
              onClick={() => router.push(`/children/${c.id}`)}
            >
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {c.fatherName} / {c.motherName}
              </TableCell>
              <TableCell className="text-center">
                <GenderBadge gender={c.gender} />
              </TableCell>
              <TableCell className="text-center">{c.ageMonths}</TableCell>
              <TableCell className="text-center">
                <span className="font-medium text-rose-600 dark:text-rose-400">
                  {c.lastWeight.toFixed(2)} kg
                </span>
              </TableCell>
              <TableCell className="text-center text-muted-foreground">
                {c.threshold.toFixed(2)} kg
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

function NoIncreaseTable({ data }: { data: NoIncreaseChild[] }) {
  const router = useRouter()
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Anak</TableHead>
          <TableHead>Orang Tua</TableHead>
          <TableHead className="text-center">L/P</TableHead>
          <TableHead className="text-center">BB Bulan Lalu</TableHead>
          <TableHead className="text-center">BB Terakhir</TableHead>
          <TableHead className="text-center">Perubahan</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <EmptyRow message="Tidak ada anak dengan berat stagnan 2 bulan berturut-turut." />
        ) : (
          data.map((c) => {
            const diff = c.lastWeight - c.prevWeight
            return (
              <TableRow
                key={c.id}
                className="cursor-pointer"
                onClick={() => router.push(`/children/${c.id}`)}
              >
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {c.fatherName} / {c.motherName}
                </TableCell>
                <TableCell className="text-center">
                  <GenderBadge gender={c.gender} />
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {c.prevWeight.toFixed(2)} kg
                  <span className="ml-1 text-xs text-muted-foreground/60">(bln {c.prevMonth})</span>
                </TableCell>
                <TableCell className="text-center">
                  {c.lastWeight.toFixed(2)} kg
                  <span className="ml-1 text-xs text-muted-foreground/60">(bln {c.lastMonth})</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`font-medium ${diff < 0 ? "text-rose-600 dark:text-rose-400" : "text-orange-500"}`}>
                    {diff >= 0 ? "+" : ""}{diff.toFixed(2)} kg
                  </span>
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}

const tabOptions = [
  { value: "bgm",         label: "BGM / Di bawah -3SD WHO",  icon: AlertTriangleIcon },
  { value: "no-increase", label: "Tidak Naik 2 Bulan",        icon: TrendingDownIcon },
]

export function VisitTables({
  bgm,
  noIncrease,
}: {
  bgm: BgmChild[]
  noIncrease: NoIncreaseChild[]
}) {
  const [tab, setTab] = useState("bgm")
  const counts: Record<string, number> = { bgm: bgm.length, "no-increase": noIncrease.length }

  return (
    <Tabs value={tab} onValueChange={setTab}>
      {/* Mobile: select dropdown */}
      <div className="md:hidden">
        <Select value={tab} onValueChange={setTab}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tabOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center gap-2">
                  <opt.icon className="size-3.5" />
                  {opt.label}
                  {counts[opt.value] > 0 && (
                    <Badge variant="destructive" className="ml-1 text-xs">
                      {counts[opt.value]}
                    </Badge>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: tab pills */}
      <TabsList className="hidden md:inline-flex">
        <TabsTrigger value="bgm" className="gap-2">
          <AlertTriangleIcon className="size-3.5" />
          BGM / Di bawah -3SD WHO
          {bgm.length > 0 && (
            <Badge variant="destructive" className="ml-1 text-xs">
              {bgm.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="no-increase" className="gap-2">
          <TrendingDownIcon className="size-3.5" />
          Tidak Naik 2 Bulan
          {noIncrease.length > 0 && (
            <Badge variant="destructive" className="ml-1 text-xs">
              {noIncrease.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="bgm" className="mt-4 overflow-x-auto rounded-md border">
        <BgmTable data={bgm} />
      </TabsContent>

      <TabsContent value="no-increase" className="mt-4 overflow-x-auto rounded-md border">
        <NoIncreaseTable data={noIncrease} />
      </TabsContent>
    </Tabs>
  )
}
