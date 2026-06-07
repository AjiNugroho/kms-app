import { NextRequest, NextResponse } from "next/server"
import { asc, eq } from "drizzle-orm"
import { z, flattenError } from "zod"

import { db } from "@/db/drizzle"
import { childGrowth } from "@/db/auth-schema"

const growthSchema = z.object({
  month: z.number().int().min(1, "Bulan harus minimal 1"),
  weight: z.string().nullable().optional(),
  length: z.string().nullable().optional(),
  headCircumference: z.string().nullable().optional(),
  status: z.enum(["up", "down", "stale"]).nullable().optional(),
  note: z.string().nullable().optional(),
})

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const rows = await db
    .select()
    .from(childGrowth)
    .where(eq(childGrowth.childId, id))
    .orderBy(asc(childGrowth.month))
  return NextResponse.json(rows)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const parsed = growthSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: flattenError(parsed.error) }, { status: 400 })
  }

  const [row] = await db
    .insert(childGrowth)
    .values({ id: crypto.randomUUID(), childId: id, ...parsed.data })
    .onConflictDoUpdate({
      target: [childGrowth.childId, childGrowth.month],
      set: {
        weight: parsed.data.weight ?? null,
        length: parsed.data.length ?? null,
        headCircumference: parsed.data.headCircumference ?? null,
        status: parsed.data.status ?? null,
        note: parsed.data.note ?? null,
        updatedAt: new Date(),
      },
    })
    .returning()

  return NextResponse.json(row, { status: 201 })
}
