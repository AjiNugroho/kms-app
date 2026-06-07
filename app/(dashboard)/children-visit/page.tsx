import { asc } from "drizzle-orm"
import { db } from "@/db/drizzle"
import { children, childGrowth } from "@/db/auth-schema"
import {
  WHO_WEIGHT_BOYS,
  WHO_WEIGHT_GIRLS,
} from "@/app/(dashboard)/children/[id]/datahooks/who-standards"
import { VisitTables, type BgmChild, type NoIncreaseChild } from "./components/visit-tables"

const WHO_MINUS2SD_BOYS  = new Map(WHO_WEIGHT_BOYS.map((r) => [r[0], r[2]]))
const WHO_MINUS2SD_GIRLS = new Map(WHO_WEIGHT_GIRLS.map((r) => [r[0], r[2]]))

async function getWatchLists() {
  const [allChildren, allGrowth] = await Promise.all([
    db
      .select({
        id: children.id,
        name: children.name,
        gender: children.gender,
        fatherName: children.fatherName,
        motherName: children.motherName,
      })
      .from(children),
    db
      .select({
        childId: childGrowth.childId,
        month: childGrowth.month,
        weight: childGrowth.weight,
      })
      .from(childGrowth)
      .orderBy(asc(childGrowth.month)),
  ])

  // Group weight records per child (already ordered by month asc)
  const growthByChild = new Map<string, { month: number; weight: number }[]>()
  for (const r of allGrowth) {
    if (r.weight === null) continue
    const w = parseFloat(r.weight)
    if (isNaN(w)) continue
    if (!growthByChild.has(r.childId)) growthByChild.set(r.childId, [])
    growthByChild.get(r.childId)!.push({ month: r.month, weight: w })
  }

  const bgm: BgmChild[] = []
  const noIncrease: NoIncreaseChild[] = []

  for (const child of allChildren) {
    const records = growthByChild.get(child.id) ?? []
    if (records.length === 0) continue

    const whoMap = child.gender === "laki-laki" ? WHO_MINUS2SD_BOYS : WHO_MINUS2SD_GIRLS
    const last = records[records.length - 1]

    // BGM check: latest weight < WHO -2SD
    const threshold = whoMap.get(Math.min(60, Math.max(0, last.month)))
    if (threshold !== undefined && last.weight < threshold) {
      bgm.push({
        id: child.id,
        name: child.name,
        gender: child.gender,
        fatherName: child.fatherName,
        motherName: child.motherName,
        ageMonths: last.month,
        lastWeight: last.weight,
        threshold,
      })
    }

    // No-increase check: last 2 records, last <= prev
    if (records.length >= 2) {
      const prev = records[records.length - 2]
      if (last.weight <= prev.weight) {
        noIncrease.push({
          id: child.id,
          name: child.name,
          gender: child.gender,
          fatherName: child.fatherName,
          motherName: child.motherName,
          prevMonth: prev.month,
          prevWeight: prev.weight,
          lastMonth: last.month,
          lastWeight: last.weight,
        })
      }
    }
  }

  // Sort by name
  bgm.sort((a, b) => a.name.localeCompare(b.name))
  noIncrease.sort((a, b) => a.name.localeCompare(b.name))

  return { bgm, noIncrease }
}

export default async function ChildrenVisitPage() {
  const { bgm, noIncrease } = await getWatchLists()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Perhatian Khusus</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Daftar anak yang memerlukan perhatian berdasarkan data tumbuh kembang terakhir.
        </p>
      </div>

      <VisitTables bgm={bgm} noIncrease={noIncrease} />
    </div>
  )
}
