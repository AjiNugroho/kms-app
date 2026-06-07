import { NextRequest, NextResponse } from "next/server"
import { ilike } from "drizzle-orm"
import { z, flattenError } from "zod"

import { db } from "@/db/drizzle"
import { children } from "@/db/auth-schema"

const childSchema = z.object({
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

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") ?? ""

  const rows = search
    ? await db.select().from(children).where(ilike(children.name, `%${search}%`))
    : await db.select().from(children)

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = childSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: flattenError(parsed.error) }, { status: 400 })
  }

  try {
    const [child] = await db
      .insert(children)
      .values({ id: crypto.randomUUID(), ...parsed.data })
      .returning()

    return NextResponse.json(child, { status: 201 })
  } catch (e: unknown) {
    if (isDuplicateKeyError(e)) {
      return NextResponse.json(
        { error: "Data anak sudah ada (kombinasi nama, nama ayah, dan nama ibu sama)" },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 })
  }
}
