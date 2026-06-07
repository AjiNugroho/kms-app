import { NextRequest, NextResponse } from "next/server"
import { asc, eq } from "drizzle-orm"
import { z, flattenError } from "zod"

import { db } from "@/db/drizzle"
import { childImmunization } from "@/db/auth-schema"

const immunizationSchema = z.object({
  type: z.enum(["vitamin", "vaksin"], { error: "Jenis wajib dipilih" }),
  name: z.string().min(1, "Nama wajib diisi"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  note: z.string().nullable().optional(),
})

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const rows = await db
    .select()
    .from(childImmunization)
    .where(eq(childImmunization.childId, id))
    .orderBy(asc(childImmunization.date))
  return NextResponse.json(rows)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const parsed = immunizationSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: flattenError(parsed.error) }, { status: 400 })
  }

  const [row] = await db
    .insert(childImmunization)
    .values({ id: crypto.randomUUID(), childId: id, ...parsed.data })
    .returning()

  return NextResponse.json(row, { status: 201 })
}
