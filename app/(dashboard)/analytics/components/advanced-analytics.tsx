import { Fragment } from "react"
import { asc } from "drizzle-orm"
import { db } from "@/db/drizzle"
import { children, childGrowth } from "@/db/auth-schema"
import {
  WHO_WEIGHT_BOYS,
  WHO_WEIGHT_GIRLS,
} from "@/app/(dashboard)/children/[id]/datahooks/who-standards"
import type { AgeGroupData } from "./age-group-table"

const WHO_MINUS3SD_BOYS  = new Map(WHO_WEIGHT_BOYS.map((r) => [r[0], r[1]]))
const WHO_MINUS3SD_GIRLS = new Map(WHO_WEIGHT_GIRLS.map((r) => [r[0], r[1]]))

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
      const whoMap = child.gender === "laki-laki" ? WHO_MINUS3SD_BOYS : WHO_MINUS3SD_GIRLS
      const sd3 = whoMap.get(Math.min(60, Math.max(0, lastW.month)))
      if (sd3 !== undefined && lastW.w < sd3) m4.push(entry)
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
    <section>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th
                rowSpan={2}
                className="whitespace-nowrap px-4 py-2.5 text-left font-semibold"
              >
                Kategori
              </th>
              {AGE_GROUPS.map((g) => (
                <th
                  key={g.label}
                  colSpan={2}
                  className="border-l px-3 py-2.5 text-center font-semibold"
                >
                  {g.label}
                </th>
              ))}
            </tr>
            <tr className="border-b bg-muted/30">
              {AGE_GROUPS.map((g) => (
                <Fragment key={g.label}>
                  <th className="border-l px-3 py-1.5 text-center text-xs font-medium text-blue-600 dark:text-blue-400">
                    L
                  </th>
                  <th className="px-3 py-1.5 text-center text-xs font-medium text-rose-500 dark:text-rose-400">
                    P
                  </th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((m, i) => (
              <tr key={m.title} className={i % 2 === 1 ? "bg-muted/20" : ""}>
                <td className="whitespace-nowrap border-b px-4 py-2.5 font-medium">
                  {m.title}
                </td>
                {m.groups.map((g) => (
                  <Fragment key={g.label}>
                    <td className="border-b border-l px-3 py-2.5 text-center font-semibold text-blue-600 dark:text-blue-400">
                      {g.male}
                    </td>
                    <td className="border-b px-3 py-2.5 text-center font-semibold text-rose-500 dark:text-rose-400">
                      {g.female}
                    </td>
                  </Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
