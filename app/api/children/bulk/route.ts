import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

import { db } from "@/db/drizzle"
import { children } from "@/db/auth-schema"

function parseExcelDate(val: unknown): string {
  if (!val) return ""
  if (val instanceof Date) {
    return val.toISOString().split("T")[0]
  }
  if (typeof val === "number") {
    const parsed = XLSX.SSF.parse_date_code(val)
    if (parsed) {
      const m = String(parsed.m).padStart(2, "0")
      const d = String(parsed.d).padStart(2, "0")
      return `${parsed.y}-${m}-${d}`
    }
  }
  const d = new Date(String(val))
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0]
  return String(val)
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

  const toInsert = rows
    .map((row) => {
      const rawGender = String(row["Jenis Kelamin"] ?? "").trim().toLowerCase()
      const gender = rawGender === "perempuan" ? "perempuan" : "laki-laki"
      return {
        id: crypto.randomUUID(),
        name: String(row["Nama"] ?? "").trim(),
        bornDate: parseExcelDate(row["Tanggal Lahir"]),
        gender,
        fatherName: String(row["Nama Ayah"] ?? "").trim(),
        motherName: String(row["Nama Ibu"] ?? "").trim(),
        address: String(row["Alamat"] ?? "").trim(),
        bornWeight: String(Number(row["Berat Lahir (kg)"] ?? 0)),
        bornLength: String(Number(row["Panjang Lahir (cm)"] ?? 0)),
      }
    })
    .filter((r) => r.name && r.fatherName && r.motherName && r.bornDate)

  if (!toInsert.length) {
    return NextResponse.json(
      { error: "Tidak ada data valid di file. Pastikan kolom sesuai template." },
      { status: 400 }
    )
  }

  await db.insert(children).values(toInsert).onConflictDoNothing()

  return NextResponse.json({ inserted: toInsert.length })
}
