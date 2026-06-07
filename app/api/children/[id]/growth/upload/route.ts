import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

import { db } from "@/db/drizzle"
import { childGrowth } from "@/db/auth-schema"

const STATUS_MAP: Record<string, "up" | "down" | "stale"> = {
  naik: "up",
  turun: "down",
  tetap: "stale",
  up: "up",
  down: "down",
  stale: "stale",
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: "array" })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

  const toUpsert = rows
    .map((row) => {
      const month = parseInt(String(row["Bulan"] ?? ""), 10)
      const rawStatus = String(row["Status"] ?? "").trim().toLowerCase()
      return {
        id: crypto.randomUUID(),
        childId: id,
        month,
        weight: row["Berat (kg)"] != null && row["Berat (kg)"] !== "" ? String(Number(row["Berat (kg)"])) : null,
        length: row["Panjang (cm)"] != null && row["Panjang (cm)"] !== "" ? String(Number(row["Panjang (cm)"])) : null,
        headCircumference:
          row["Lingkar Kepala (cm)"] != null && row["Lingkar Kepala (cm)"] !== ""
            ? String(Number(row["Lingkar Kepala (cm)"]))
            : null,
        status: STATUS_MAP[rawStatus] ?? null,
        note: row["Catatan"] != null ? String(row["Catatan"]).trim() : null,
      }
    })
    .filter((r) => Number.isInteger(r.month) && r.month >= 1)

  if (!toUpsert.length) {
    return NextResponse.json(
      { error: "Tidak ada data valid. Pastikan kolom Bulan berisi angka (1, 2, 3, ...)" },
      { status: 400 }
    )
  }

  await db
    .insert(childGrowth)
    .values(toUpsert)
    .onConflictDoUpdate({
      target: [childGrowth.childId, childGrowth.month],
      set: {
        weight: childGrowth.weight,
        length: childGrowth.length,
        headCircumference: childGrowth.headCircumference,
        status: childGrowth.status,
        note: childGrowth.note,
        updatedAt: new Date(),
      },
    })

  return NextResponse.json({ upserted: toUpsert.length })
}
