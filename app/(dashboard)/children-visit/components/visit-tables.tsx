"use client"

import Link from "next/link"
import { AlertTriangleIcon, TrendingDownIcon, ExternalLinkIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Anak</TableHead>
          <TableHead>Orang Tua</TableHead>
          <TableHead className="text-center">L/P</TableHead>
          <TableHead className="text-center">Usia (bln)</TableHead>
          <TableHead className="text-center">BB Terakhir</TableHead>
          <TableHead className="text-center">Batas WHO -2SD</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <EmptyRow message="Tidak ada anak dengan berat di bawah -2 SD WHO." />
        ) : (
          data.map((c) => (
            <TableRow key={c.id}>
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
              <TableCell className="text-right">
                <Link
                  href={`/children/${c.id}`}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Detail <ExternalLinkIcon className="size-3" />
                </Link>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

function NoIncreaseTable({ data }: { data: NoIncreaseChild[] }) {
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
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <EmptyRow message="Tidak ada anak dengan berat stagnan 2 bulan berturut-turut." />
        ) : (
          data.map((c) => {
            const diff = c.lastWeight - c.prevWeight
            return (
              <TableRow key={c.id}>
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
                <TableCell className="text-right">
                  <Link
                    href={`/children/${c.id}`}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Detail <ExternalLinkIcon className="size-3" />
                  </Link>
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}

export function VisitTables({
  bgm,
  noIncrease,
}: {
  bgm: BgmChild[]
  noIncrease: NoIncreaseChild[]
}) {
  return (
    <Tabs defaultValue="bgm">
      <TabsList>
        <TabsTrigger value="bgm" className="gap-2">
          <AlertTriangleIcon className="size-3.5" />
          BGM / Di bawah -2SD WHO
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
