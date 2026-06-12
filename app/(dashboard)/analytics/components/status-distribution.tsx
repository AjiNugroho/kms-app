import { asc } from "drizzle-orm"
import { db } from "@/db/drizzle"
import { children, childGrowth } from "@/db/auth-schema"
import {
  WHO_WEIGHT_BOYS,
  WHO_WEIGHT_GIRLS,
  WHO_HEIGHT_BOYS,
  WHO_HEIGHT_GIRLS,
} from "@/app/(dashboard)/children/[id]/datahooks/who-standards"

// Pre-built Maps for O(1) lookup by age month
const W_BOYS  = new Map(WHO_WEIGHT_BOYS.map((r)  => [r[0], r]))
const W_GIRLS = new Map(WHO_WEIGHT_GIRLS.map((r) => [r[0], r]))
const H_BOYS  = new Map(WHO_HEIGHT_BOYS.map((r)  => [r[0], r]))
const H_GIRLS = new Map(WHO_HEIGHT_GIRLS.map((r) => [r[0], r]))

function clampMonth(m: number) { return Math.min(60, Math.max(0, m)) }

type WeightKey = "sangat_kurang" | "kurang" | "baik" | "lebih" | "obesitas" | "tidak_terukur"
type HeightKey = "sangat_pendek" | "pendek" | "normal" | "tinggi" | "tidak_terukur"

function classifyWeight(w: number, month: number, gender: string): WeightKey {
  const row = (gender === "laki-laki" ? W_BOYS : W_GIRLS).get(clampMonth(month))
  if (!row) return "baik"
  const [, sd3n, sd2n, , , , sd2, sd3] = row
  if (w < sd3n)        return "sangat_kurang"
  if (w < sd2n)        return "kurang"
  if (w <= sd2)        return "baik"
  if (w <= sd3)        return "lebih"
  return "obesitas"
}

function classifyHeight(h: number, month: number, gender: string): HeightKey {
  const row = (gender === "laki-laki" ? H_BOYS : H_GIRLS).get(clampMonth(month))
  if (!row) return "normal"
  const [, sd3n, sd2n, , , , , sd3] = row
  if (h < sd3n)        return "sangat_pendek"
  if (h < sd2n)        return "pendek"
  if (h <= sd3)        return "normal"
  return "tinggi"
}

type Counts = { male: number; female: number }

const WEIGHT_ROWS: { key: WeightKey; label: string; color: string }[] = [
  { key: "sangat_kurang",  label: "Gizi Sangat Kurang", color: "text-rose-600 dark:text-rose-400" },
  { key: "kurang",         label: "Gizi Kurang",         color: "text-orange-500 dark:text-orange-400" },
  { key: "baik",           label: "Gizi Baik",           color: "text-emerald-600 dark:text-emerald-400" },
  { key: "lebih",          label: "Gizi Lebih",          color: "text-orange-500 dark:text-orange-400" },
  { key: "obesitas",       label: "Obesitas",            color: "text-rose-600 dark:text-rose-400" },
  { key: "tidak_terukur",  label: "Tidak Terukur",       color: "text-muted-foreground" },
]

const HEIGHT_ROWS: { key: HeightKey; label: string; color: string }[] = [
  { key: "sangat_pendek", label: "Sangat Pendek", color: "text-rose-600 dark:text-rose-400" },
  { key: "pendek",        label: "Pendek",         color: "text-orange-500 dark:text-orange-400" },
  { key: "normal",        label: "Normal",         color: "text-emerald-600 dark:text-emerald-400" },
  { key: "tinggi",        label: "Tinggi",         color: "text-blue-600 dark:text-blue-400" },
  { key: "tidak_terukur", label: "Tidak Terukur",  color: "text-muted-foreground" },
]

function StatusTable<K extends string>({
  title,
  subtitle,
  rows,
  counts,
  total,
}: {
  title: string
  subtitle: string
  rows: { key: K; label: string; color: string }[]
  counts: Record<string, Counts>
  total: number
}) {
  const totalMale   = rows.reduce((s, r) => s + (counts[r.key]?.male   ?? 0), 0)
  const totalFemale = rows.reduce((s, r) => s + (counts[r.key]?.female ?? 0), 0)

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-2.5 text-left font-semibold">Status</th>
              <th className="border-l px-5 py-2.5 text-center font-semibold text-blue-600 dark:text-blue-400">L</th>
              <th className="border-l px-5 py-2.5 text-center font-semibold text-rose-500 dark:text-rose-400">P</th>
              <th className="border-l px-5 py-2.5 text-center font-semibold">Total</th>
              <th className="border-l px-5 py-2.5 text-center font-semibold text-muted-foreground">%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const c     = counts[row.key] ?? { male: 0, female: 0 }
              const rowTotal = c.male + c.female
              const pct   = total > 0 ? Math.round((rowTotal / total) * 100) : 0
              return (
                <tr key={row.key} className={i % 2 === 1 ? "bg-muted/20" : ""}>
                  <td className={`border-b px-4 py-2.5 font-medium ${row.color}`}>{row.label}</td>
                  <td className="border-b border-l px-5 py-2.5 text-center font-semibold text-blue-600 dark:text-blue-400">{c.male}</td>
                  <td className="border-b border-l px-5 py-2.5 text-center font-semibold text-rose-500 dark:text-rose-400">{c.female}</td>
                  <td className="border-b border-l px-5 py-2.5 text-center">{rowTotal}</td>
                  <td className="border-b border-l px-5 py-2.5 text-center text-muted-foreground">{pct}%</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-muted/40 font-semibold">
              <td className="px-4 py-2.5">Total</td>
              <td className="border-l px-5 py-2.5 text-center text-blue-600 dark:text-blue-400">{totalMale}</td>
              <td className="border-l px-5 py-2.5 text-center text-rose-500 dark:text-rose-400">{totalFemale}</td>
              <td className="border-l px-5 py-2.5 text-center">{total}</td>
              <td className="border-l px-5 py-2.5 text-center text-muted-foreground">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export async function NutritionStatusTables() {
  const [allChildren, allGrowth] = await Promise.all([
    db.select({ id: children.id, gender: children.gender }).from(children),
    db
      .select({
        childId: childGrowth.childId,
        month:   childGrowth.month,
        weight:  childGrowth.weight,
        length:  childGrowth.length,
      })
      .from(childGrowth)
      .orderBy(asc(childGrowth.month)),
  ])

  // Latest weight and height per child (highest month wins since already asc)
  const latestW = new Map<string, { month: number; w: number }>()
  const latestH = new Map<string, { month: number; h: number }>()

  for (const r of allGrowth) {
    if (r.weight !== null) {
      const w = parseFloat(r.weight)
      if (!isNaN(w)) latestW.set(r.childId, { month: r.month, w })
    }
    if (r.length !== null) {
      const h = parseFloat(r.length)
      if (!isNaN(h)) latestH.set(r.childId, { month: r.month, h })
    }
  }

  const weightCounts = Object.fromEntries(
    WEIGHT_ROWS.map((r) => [r.key, { male: 0, female: 0 }])
  ) as Record<WeightKey, Counts>

  const heightCounts = Object.fromEntries(
    HEIGHT_ROWS.map((r) => [r.key, { male: 0, female: 0 }])
  ) as Record<HeightKey, Counts>

  for (const child of allChildren) {
    const isMale = child.gender === "laki-laki"

    const wData = latestW.get(child.id)
    const wKey  = wData ? classifyWeight(wData.w, wData.month, child.gender) : "tidak_terukur"
    if (isMale) weightCounts[wKey].male++
    else        weightCounts[wKey].female++

    const hData = latestH.get(child.id)
    const hKey  = hData ? classifyHeight(hData.h, hData.month, child.gender) : "tidak_terukur"
    if (isMale) heightCounts[hKey].male++
    else        heightCounts[hKey].female++
  }

  const total = allChildren.length

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <StatusTable
        title="Status Gizi (Berat Badan/Umur)"
        subtitle="Berdasarkan z-score WHO weight-for-age, pengukuran terakhir"
        rows={WEIGHT_ROWS}
        counts={weightCounts}
        total={total}
      />
      <StatusTable
        title="Status Tinggi Badan (Tinggi/Umur)"
        subtitle="Berdasarkan z-score WHO height-for-age, pengukuran terakhir"
        rows={HEIGHT_ROWS}
        counts={heightCounts}
        total={total}
      />
    </div>
  )
}
