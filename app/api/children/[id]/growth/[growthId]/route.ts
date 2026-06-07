import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z, flattenError } from "zod"

import { db } from "@/db/drizzle"
import { childGrowth } from "@/db/auth-schema"

const updateSchema = z.object({
  weight: z.string().nullable().optional(),
  length: z.string().nullable().optional(),
  headCircumference: z.string().nullable().optional(),
  status: z.enum(["up", "down", "stale"]).nullable().optional(),
  note: z.string().nullable().optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ growthId: string }> }
) {
  const { growthId } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: flattenError(parsed.error) }, { status: 400 })
  }

  const [updated] = await db
    .update(childGrowth)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(childGrowth.id, growthId))
    .returning()

  if (!updated) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ growthId: string }> }
) {
  const { growthId } = await params
  await db.delete(childGrowth).where(eq(childGrowth.id, growthId))
  return NextResponse.json({ success: true })
}
