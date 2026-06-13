import { asc } from "drizzle-orm"
import { db } from "@/db/drizzle"
import { children, childGrowth } from "@/db/auth-schema"
import {
  WHO_WEIGHT_BOYS,
  WHO_WEIGHT_GIRLS,
  WHO_HEIGHT_BOYS,
  WHO_HEIGHT_GIRLS,
} from "@/app/(dashboard)/children/[id]/datahooks/who-standards"
import { VisitTables, type BgmChild, type NoIncreaseChild, type StuntingChild } from "./components/visit-tables"

const WHO_WEIGHT_MINUS3SD_BOYS  = new Map(WHO_WEIGHT_BOYS.map((r) => [r[0], r[1]]))
const WHO_WEIGHT_MINUS3SD_GIRLS = new Map(WHO_WEIGHT_GIRLS.map((r) => [r[0], r[1]]))
const WHO_HEIGHT_MINUS2SD_BOYS  = new Map(WHO_HEIGHT_BOYS.map((r) => [r[0], r[2]]))
const WHO_HEIGHT_MINUS2SD_GIRLS = new Map(WHO_HEIGHT_GIRLS.map((r) => [r[0], r[2]]))

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
        length: childGrowth.length,
      })
      .from(childGrowth)
      .orderBy(asc(childGrowth.month)),
  ])

  const weightByChild = new Map<string, { month: number; weight: number }[]>()
  const heightByChild = new Map<string, { month: number; height: number }[]>()

  for (const r of allGrowth) {
    if (r.weight !== null) {
      const w = parseFloat(r.weight)
      if (!isNaN(w)) {
        if (!weightByChild.has(r.childId)) weightByChild.set(r.childId, [])
        weightByChild.get(r.childId)!.push({ month: r.month, weight: w })
      }
    }
    if (r.length !== null) {
      const h = parseFloat(r.length)
      if (!isNaN(h)) {
        if (!heightByChild.has(r.childId)) heightByChild.set(r.childId, [])
        heightByChild.get(r.childId)!.push({ month: r.month, height: h })
      }
    }
  }

  const bgm: BgmChild[] = []
  const noIncrease: NoIncreaseChild[] = []
  const stunting: StuntingChild[] = []

  for (const child of allChildren) {
    const weightRecords = weightByChild.get(child.id) ?? []
    const heightRecords = heightByChild.get(child.id) ?? []

    // BGM: latest weight < WHO -3SD
    if (weightRecords.length >= 1) {
      const last = weightRecords[weightRecords.length - 1]
      const whoMap = child.gender === "laki-laki" ? WHO_WEIGHT_MINUS3SD_BOYS : WHO_WEIGHT_MINUS3SD_GIRLS
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
    }

    // No-increase: last 2 weight records, last <= prev
    if (weightRecords.length >= 2) {
      const last = weightRecords[weightRecords.length - 1]
      const prev = weightRecords[weightRecords.length - 2]
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

    // Stunting: latest height < WHO -2SD
    if (heightRecords.length >= 1) {
      const last = heightRecords[heightRecords.length - 1]
      const whoMap = child.gender === "laki-laki" ? WHO_HEIGHT_MINUS2SD_BOYS : WHO_HEIGHT_MINUS2SD_GIRLS
      const threshold = whoMap.get(Math.min(60, Math.max(0, last.month)))
      if (threshold !== undefined && last.height < threshold) {
        stunting.push({
          id: child.id,
          name: child.name,
          gender: child.gender,
          fatherName: child.fatherName,
          motherName: child.motherName,
          ageMonths: last.month,
          lastHeight: last.height,
          threshold,
        })
      }
    }
  }

  bgm.sort((a, b) => a.name.localeCompare(b.name))
  noIncrease.sort((a, b) => a.name.localeCompare(b.name))
  stunting.sort((a, b) => a.name.localeCompare(b.name))

  return { bgm, noIncrease, stunting }
}

export default async function ChildrenVisitPage() {
  const { bgm, noIncrease, stunting } = await getWatchLists()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Perhatian Khusus Kunjungan Rumah</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Daftar anak yang memerlukan kunjungan rumah berdasarkan indikator berat badan dan tinggi badan.
        </p>
      </div>

      <VisitTables bgm={bgm} noIncrease={noIncrease} stunting={stunting} />
    </div>
  )
}
