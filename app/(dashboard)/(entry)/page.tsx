import Link from "next/link"
import { headers } from "next/headers"
import { asc } from "drizzle-orm"
import {
  UsersIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  RulerIcon,
  ClipboardPlusIcon,
  ChartAreaIcon,
  BookOpenIcon,
  TriangleAlertIcon,
  ChevronRightIcon,
} from "lucide-react"
import { auth } from "@/lib/auth"
import { db } from "@/db/drizzle"
import { children, childGrowth } from "@/db/auth-schema"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import {
  WHO_WEIGHT_BOYS,
  WHO_WEIGHT_GIRLS,
  WHO_HEIGHT_BOYS,
  WHO_HEIGHT_GIRLS,
} from "@/app/(dashboard)/children/[id]/datahooks/who-standards"

const WHO_WEIGHT_MINUS2SD_BOYS  = new Map(WHO_WEIGHT_BOYS.map((r) => [r[0], r[2]]))
const WHO_WEIGHT_MINUS2SD_GIRLS = new Map(WHO_WEIGHT_GIRLS.map((r) => [r[0], r[2]]))
const WHO_HEIGHT_MINUS2SD_BOYS  = new Map(WHO_HEIGHT_BOYS.map((r) => [r[0], r[2]]))
const WHO_HEIGHT_MINUS2SD_GIRLS = new Map(WHO_HEIGHT_GIRLS.map((r) => [r[0], r[2]]))

async function getStats() {
  const [allChildren, allGrowth] = await Promise.all([
    db.select({ id: children.id, gender: children.gender }).from(children),
    db
      .select({
        childId: childGrowth.childId,
        month: childGrowth.month,
        weight: childGrowth.weight,
        length: childGrowth.length,
      })
      .from(childGrowth)
      .orderBy(asc(childGrowth.month)),
  ])

  const growthByChild = new Map<
    string,
    { month: number; weight: string | null; length: string | null }[]
  >()
  for (const r of allGrowth) {
    if (!growthByChild.has(r.childId)) growthByChild.set(r.childId, [])
    growthByChild.get(r.childId)!.push({ month: r.month, weight: r.weight, length: r.length })
  }

  let increased = 0
  let decreased = 0
  let bgm = 0
  let stunting = 0

  for (const child of allChildren) {
    const records = growthByChild.get(child.id) ?? []

    const weightRecords = records
      .filter((r): r is { month: number; weight: string; length: string | null } => r.weight !== null)
      .map((r) => ({ month: r.month, w: parseFloat(r.weight) }))
    const wn = weightRecords.length

    if (wn >= 2) {
      const last = weightRecords[wn - 1].w
      const prev = weightRecords[wn - 2].w
      if (last > prev) increased++
      else decreased++
    }

    if (wn >= 1) {
      const lastW = weightRecords[wn - 1]
      const whoWeightMap = child.gender === "laki-laki" ? WHO_WEIGHT_MINUS2SD_BOYS : WHO_WEIGHT_MINUS2SD_GIRLS
      const sd2w = whoWeightMap.get(Math.min(60, Math.max(0, lastW.month)))
      if (sd2w !== undefined && lastW.w < sd2w) bgm++
    }

    const heightRecords = records
      .filter((r): r is { month: number; weight: string | null; length: string } => r.length !== null)
      .map((r) => ({ month: r.month, h: parseFloat(r.length) }))
    const hn = heightRecords.length

    if (hn >= 1) {
      const lastH = heightRecords[hn - 1]
      const whoHeightMap = child.gender === "laki-laki" ? WHO_HEIGHT_MINUS2SD_BOYS : WHO_HEIGHT_MINUS2SD_GIRLS
      const sd2h = whoHeightMap.get(Math.min(60, Math.max(0, lastH.month)))
      if (sd2h !== undefined && lastH.h < sd2h) stunting++
    }
  }

  return { total: allChildren.length, increased, decreased, bgm, stunting }
}

const menuItems = [
  {
    label: "KMS Input",
    description: "Input data pertumbuhan anak",
    href: "/kms-input",
    icon: ClipboardPlusIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-950",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Rekapan",
    description: "Rekap data pertumbuhan anak",
    href: "/analytics",
    icon: ChartAreaIcon,
    iconBg: "bg-blue-100 dark:bg-blue-950",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    label: "Data Anak",
    description: "Daftar dan profil anak binaan",
    href: "/children",
    icon: UsersIcon,
    iconBg: "bg-violet-100 dark:bg-violet-950",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    label: "Kunjungan",
    description: "Anak kebutuhan kunjungan",
    href: "/children-visit",
    icon: TriangleAlertIcon,
    iconBg: "bg-rose-100 dark:bg-rose-950",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    label: "Buku Kader",
    description: "Buku panduan kader posyandu",
    href: "/guide-book",
    icon: BookOpenIcon,
    iconBg: "bg-amber-100 dark:bg-amber-950",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
]

export default async function EntryPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const name = session?.user?.name ?? "Kader"
  const { total, increased, decreased, bgm, stunting } = await getStats()

  const hour = new Date().getHours()
  const greeting =
    hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam"

  const stats = [
    {
      label: "Total Anak",
      mobileLabel: "Total",
      value: total,
      icon: UsersIcon,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "Berat Badan Naik",
      mobileLabel: "Naik",
      value: increased,
      icon: TrendingUpIcon,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      label: "Turun / Stagnan",
      mobileLabel: "Turun",
      value: decreased,
      icon: TrendingDownIcon,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950",
    },
    {
      label: "Bawah Garis Merah",
      mobileLabel: "BGM",
      value: bgm,
      icon: AlertTriangleIcon,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950",
    },
    {
      label: "Stunting (TB < -2 SD)",
      mobileLabel: "Stunting",
      value: stunting,
      icon: RulerIcon,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950",
    },
  ]

  return (
    <div>
      {/* ── Mobile: full-bleed hero header ── */}
      <div className="lg:hidden -mx-6 -mt-6 bg-primary px-6 pb-8 pt-8 text-primary-foreground">
        <div className="mb-8">
          <p>{greeting},</p>
          <h1 className="text-2xl font-semibold">{name}!</h1>
          <p className="mt-1 text-sm opacity-70">
            Ringkasan tumbuh kembang anak binaan Anda.
          </p>
        </div>

        <Card className="bg-card/15">
          <CardHeader>
            <CardDescription className="text-primary-foreground">
              Posyandu bulan ini
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="grid grid-cols-5 gap-1 w-full">
              {stats.map((s) => (
                <div key={s.mobileLabel} className="flex flex-col items-center gap-1.5 text-primary-foreground">
                  <span className="text-2xl font-bold leading-none">{s.value}</span>
                  <span className="text-center text-[10px] leading-tight opacity-75">
                    {s.mobileLabel}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Desktop: normal layout ── */}
      <div className="hidden lg:block space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">
            {greeting}, <span className="text-primary">{name}</span>! 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Berikut ringkasan kondisi tumbuh kembang anak binaan Anda.
          </p>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                <div className={`flex size-8 items-center justify-center rounded-lg ${s.bg}`}>
                  <s.icon className={`size-4 ${s.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Menu: mobile app-launcher style ── */}
      <div className="mt-8 lg:hidden">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Menu
        </p>
        <div className="grid grid-cols-2 gap-3">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 rounded-2xl border bg-card p-4 transition-colors active:bg-muted"
            >
              <div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${item.iconBg}`}>
                <item.icon className={`size-7 ${item.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="mt-0.5 text-xs leading-tight text-muted-foreground">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Menu: desktop card list ── */}
      <div className="mt-8 hidden lg:block">
        <p className="mb-4 text-sm font-semibold text-muted-foreground">Menu Cepat</p>
        <div className="grid grid-cols-3 gap-3 xl:grid-cols-5">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="group">
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}>
                    <item.icon className={`size-5 ${item.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
