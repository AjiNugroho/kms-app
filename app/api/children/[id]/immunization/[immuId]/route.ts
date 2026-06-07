import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z, flattenError } from "zod"

import { db } from "@/db/drizzle"
import { childImmunization } from "@/db/auth-schema"

const updateSchema = z.object({
  type: z.enum(["vitamin", "vaksin"], { error: "Jenis wajib dipilih" }),
  name: z.string().min(1, "Nama wajib diisi"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  note: z.string().nullable().optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ immuId: string }> }
) {
  const { immuId } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: flattenError(parsed.error) }, { status: 400 })
  }

  const [updated] = await db
    .update(childImmunization)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(childImmunization.id, immuId))
    .returning()

  if (!updated) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ immuId: string }> }
) {
  const { immuId } = await params
  await db.delete(childImmunization).where(eq(childImmunization.id, immuId))
  return NextResponse.json({ success: true })
}
