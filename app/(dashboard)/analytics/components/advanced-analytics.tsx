import { asc } from "drizzle-orm"
import { db } from "@/db/drizzle"
import { children, childGrowth } from "@/db/auth-schema"
import {
  WHO_WEIGHT_BOYS,
  WHO_WEIGHT_GIRLS,
} from "@/app/(dashboard)/children/[id]/datahooks/who-standards"
import { AgeGroupTable, type AgeGroupData } from "./age-group-table"

const WHO_MINUS2SD_BOYS  = new Map(WHO_WEIGHT_BOYS.map((r) => [r[0], r[2]]))
const WHO_MINUS2SD_GIRLS = new Map(WHO_WEIGHT_GIRLS.map((r) => [r[0], r[2]]))

const AGE_GROUPS: { label: string; min: number; max: number }[] = [
  { label: "0 – 5 bulan",   min: 0,  max: 5  },
  { label: "6 – 11 bulan",  min: 6,  max: 11 },
  { label: "12 – 23 bulan", min: 12, max: 23 },
  { label: "24 – 59 bulan", min: 24, max: 59 },
]

function calcAgeMonths(bornDate: string): number {
  const born = new Date(bornDate)
  const today = new Date()
  let months =
    (today.getFullYear() - born.getFullYear()) * 12 +
    (today.getMonth() - born.getMonth())
  if (today.getDate() < born.getDate()) months--
  return Math.max(0, months)
}

type Entry = { gender: string; ageMonths: number }

function toGroups(items: Entry[]): AgeGroupData[] {
  return AGE_GROUPS.map((g) => {
    const inGroup = items.filter((c) => c.ageMonths >= g.min && c.ageMonths <= g.max)
    return {
      label:  g.label,
      male:   inGroup.filter((c) => c.gender === "laki-laki").length,
      female: inGroup.filter((c) => c.gender === "perempuan").length,
      total:  inGroup.length,
    }
  })
}

export async function AdvancedAnalytics() {
  const [allChildren, allGrowth] = await Promise.all([
    db
      .select({ id: children.id, bornDate: children.bornDate, gender: children.gender })
      .from(children),
    db
      .select({ childId: childGrowth.childId, month: childGrowth.month, weight: childGrowth.weight })
      .from(childGrowth)
      .orderBy(asc(childGrowth.month)),
  ])

  const growthByChild = new Map<string, { month: number; weight: string | null }[]>()
  for (const r of allGrowth) {
    if (!growthByChild.has(r.childId)) growthByChild.set(r.childId, [])
    growthByChild.get(r.childId)!.push({ month: r.month, weight: r.weight })
  }

  const m1: Entry[] = [] // first-timers (exactly 1 record)
  const m2: Entry[] = [] // last weight increased
  const m3: Entry[] = [] // last weight decreased or stagnant
  const m4: Entry[] = [] // last weight below -2 SD
  const m5: Entry[] = [] // 2 consecutive decreases/stagnant

  for (const child of allChildren) {
    const ageMonths = calcAgeMonths(child.bornDate)
    const entry: Entry = { gender: child.gender, ageMonths }
    const records = growthByChild.get(child.id) ?? []

    if (records.length === 1) m1.push(entry)

    // numeric weights only, sorted by month asc (already ordered)
    const weights = records
      .filter((r): r is { month: number; weight: string } => r.weight !== null)
      .map((r) => ({ month: r.month, w: parseFloat(r.weight) }))
    const n = weights.length

    if (n >= 2) {
      const last = weights[n - 1].w
      const prev = weights[n - 2].w
      if (last > prev)  m2.push(entry)
      if (last <= prev) m3.push(entry)
    }

    if (n >= 1) {
      const lastW = weights[n - 1]
      const whoMap = child.gender === "laki-laki" ? WHO_MINUS2SD_BOYS : WHO_MINUS2SD_GIRLS
      const sd2 = whoMap.get(Math.min(60, Math.max(0, lastW.month)))
      if (sd2 !== undefined && lastW.w < sd2) m4.push(entry)
    }

    if (n >= 3) {
      const last     = weights[n - 1].w
      const prev     = weights[n - 2].w
      const prevPrev = weights[n - 3].w
      if (last <= prev && prev <= prevPrev) m5.push(entry)
    }
  }

  const metrics = [
    { title: "Kunjungan Pertama",          groups: toGroups(m1) },
    { title: "Naik Berat Badan",           groups: toGroups(m2) },
    { title: "Turun / Stagnan",            groups: toGroups(m3) },
    { title: "Di Bawah Garis Merah",            groups: toGroups(m4) },
    { title: "2x Berturut Turun / Stagnan", groups: toGroups(m5) },
  ]

  return (
    <section className="space-y-4">
      {/* <h2 className="text-lg font-semibold">Analisis Pertumbuhan</h2> */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <AgeGroupTable key={m.title} title={m.title} groups={m.groups} />
        ))}
      </div>
    </section>
  )
}
