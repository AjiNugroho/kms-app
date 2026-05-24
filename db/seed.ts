import { eq } from "drizzle-orm"
import { db } from "./drizzle"
import { user } from "./auth-schema"
import { auth } from "@/lib/auth"

async function seedSuperadmin() {
  const email = process.env.SUPERADMIN_EMAIL
  const password = process.env.SUPERADMIN_PASSWORD
  const name = process.env.SUPERADMIN_NAME

  if (!email || !password || !name) {
    throw new Error(
      "SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, dan SUPERADMIN_NAME harus ada di .env"
    )
  }

  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1)

  if (existing.length > 0) {
    console.log("✓ Superadmin sudah ada, seeding dilewati.")
    return
  }

  await auth.api.signUpEmail({
    body: { email, password, name },
  })

  console.log("✓ Superadmin berhasil dibuat!")
  console.log(`  Nama  : ${name}`)
  console.log(`  Email : ${email}`)
}

seedSuperadmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Seeding gagal:", err)
    process.exit(1)
  })
