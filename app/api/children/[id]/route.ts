import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z, flattenError } from "zod"

import { db } from "@/db/drizzle"
import { children } from "@/db/auth-schema"

const updateSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  bornDate: z.string().min(1, "Tanggal lahir wajib diisi"),
  gender: z.enum(["laki-laki", "perempuan"], { error: "Jenis kelamin wajib dipilih" }),
  fatherName: z.string().min(1, "Nama ayah wajib diisi"),
  motherName: z.string().min(1, "Nama ibu wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  bornWeight: z.string().min(1, "Berat lahir wajib diisi"),
  bornLength: z.string().min(1, "Panjang lahir wajib diisi"),
  bornCircumference: z.string().min(1, "Lingkar kepala lahir wajib diisi"),
})

function isDuplicateKeyError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as Record<string, unknown>)["code"] === "23505"
  )
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const [child] = await db.select().from(children).where(eq(children.id, id))
  if (!child) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 })
  return NextResponse.json(child)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: flattenError(parsed.error) }, { status: 400 })
  }

  try {
    const [updated] = await db
      .update(children)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(children.id, id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (e: unknown) {
    if (isDuplicateKeyError(e)) {
      return NextResponse.json(
        { error: "Data anak sudah ada (kombinasi nama, nama ayah, dan nama ibu sama)" },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: "Gagal memperbarui data" }, { status: 500 })
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.delete(children).where(eq(children.id, id))
  return NextResponse.json({ success: true })
}
