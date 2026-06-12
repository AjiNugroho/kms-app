import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { CalendarIcon, MailIcon, ShieldIcon, UserIcon } from "lucide-react"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LogoutButton } from "./components/logout-button"

const roleLabel: Record<string, string> = {
  superadmin: "Super Admin",
  kader: "Kader Posyandu",
  normaluser: "Pengguna",
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const user = session.user
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()

  const joinDate = new Date(user.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const role = (user as { role?: string }).role ?? "normaluser"

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profil Saya</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Informasi akun Anda di sistem SIKAGI.
        </p>
      </div>

      {/* Avatar + name */}
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8">
          <div className="flex size-20 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            {initials}
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Detail info */}
      <Card>
        <CardHeader className="pb-2">
          <p className="text-sm font-medium text-muted-foreground">Detail Akun</p>
        </CardHeader>
        <CardContent className="space-y-0 p-0">
          <InfoRow icon={UserIcon} label="Nama Lengkap" value={user.name} />
          <Separator />
          <InfoRow icon={MailIcon} label="Email" value={user.email} />
          <Separator />
          <InfoRow
            icon={ShieldIcon}
            label="Peran"
            value={roleLabel[role] ?? role}
          />
          <Separator />
          <InfoRow icon={CalendarIcon} label="Bergabung sejak" value={joinDate} />
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="py-4">
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-3">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  )
}
