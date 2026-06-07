import { NextRequest, NextResponse } from "next/server"
import { asc, eq } from "drizzle-orm"
import * as XLSX from "xlsx"

import { db } from "@/db/drizzle"
import { children, childGrowth } from "@/db/auth-schema"

const STATUS_LABEL: Record<string, string> = {
  up: "naik",
  down: "turun",
  stale: "tetap",
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const [[child], rows] = await Promise.all([
    db.select({ name: children.name }).from(children).where(eq(children.id, id)),
    db.select().from(childGrowth).where(eq(childGrowth.childId, id)).orderBy(asc(childGrowth.month)),
  ])

  const safeName = (child?.name ?? "anak").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")

  const sheetData = [
    ["Bulan", "Berat (kg)", "Panjang (cm)", "Lingkar Kepala (cm)", "Status", "Catatan"],
    ...rows.map((r) => [
      r.month,
      r.weight ?? "",
      r.length ?? "",
      r.headCircumference ?? "",
      r.status ? (STATUS_LABEL[r.status] ?? r.status) : "",
      r.note ?? "",
    ]),
  ]

  if (rows.length === 0) {
    sheetData.push([1, "", "", "", "naik", ""])
  }

  const ws = XLSX.utils.aoa_to_sheet(sheetData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Perkembangan")

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="perkembangan-${safeName}.xlsx"`,
    },
  })
}
