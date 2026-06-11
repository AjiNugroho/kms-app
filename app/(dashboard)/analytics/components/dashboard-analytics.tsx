import { db } from "@/db/drizzle"
import { children } from "@/db/auth-schema"
import { SummaryCards } from "./summary-cards"

const AGE_GROUPS: { label: string; min: number; max: number }[] = [
  { label: "< 3 bulan",     min: 0,  max: 2        },
  { label: "3 – 8 bulan",   min: 3,  max: 8        },
  { label: "9 – 11 bulan",  min: 9,  max: 11       },
  { label: "12 – 17 bulan", min: 12, max: 17       },
  { label: "18 – 23 bulan", min: 18, max: 23       },
  { label: "24 – 29 bulan", min: 24, max: 29       },
  { label: "30 – 35 bulan", min: 30, max: 35       },
  { label: "36 – 41 bulan", min: 36, max: 41       },
  { label: "42 – 47 bulan", min: 42, max: 47       },
  { label: "48 – 53 bulan", min: 48, max: 53       },
  { label: "54 – 59 bulan", min: 54, max: 59       },
  { label: "≥ 60 bulan",    min: 60, max: Infinity },
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

export async function SummarySection() {
  const rows = await db
    .select({ bornDate: children.bornDate, gender: children.gender })
    .from(children)

  const totalMale   = rows.filter((r) => r.gender === "laki-laki").length
  const totalFemale = rows.filter((r) => r.gender === "perempuan").length

  return <SummaryCards total={rows.length} male={totalMale} female={totalFemale} />
}

export async function DistributionTable() {
  const rows = await db
    .select({ bornDate: children.bornDate, gender: children.gender })
    .from(children)

  const groups = AGE_GROUPS.map((g) => {
    const inGroup = rows.filter((r) => {
      const age = calcAgeMonths(r.bornDate)
      return age >= g.min && age <= g.max
    })
    return {
      label:  g.label,
      male:   inGroup.filter((r) => r.gender === "laki-laki").length,
      female: inGroup.filter((r) => r.gender === "perempuan").length,
      total:  inGroup.length,
    }
  })

  const totalMale   = groups.reduce((s, g) => s + g.male,   0)
  const totalFemale = groups.reduce((s, g) => s + g.female, 0)
  const grandTotal  = totalMale + totalFemale

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-2.5 text-left font-semibold">Kelompok Usia</th>
            <th className="border-l px-6 py-2.5 text-center font-semibold text-blue-600 dark:text-blue-400">L</th>
            <th className="border-l px-6 py-2.5 text-center font-semibold text-rose-500 dark:text-rose-400">P</th>
            <th className="border-l px-6 py-2.5 text-center font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g, i) => (
            <tr key={g.label} className={i % 2 === 1 ? "bg-muted/20" : ""}>
              <td className="border-b px-4 py-2.5">{g.label}</td>
              <td className="border-b border-l px-6 py-2.5 text-center font-semibold text-blue-600 dark:text-blue-400">{g.male}</td>
              <td className="border-b border-l px-6 py-2.5 text-center font-semibold text-rose-500 dark:text-rose-400">{g.female}</td>
              <td className="border-b border-l px-6 py-2.5 text-center text-muted-foreground">{g.total}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-muted/40 font-semibold">
            <td className="px-4 py-2.5">Total</td>
            <td className="border-l px-6 py-2.5 text-center text-blue-600 dark:text-blue-400">{totalMale}</td>
            <td className="border-l px-6 py-2.5 text-center text-rose-500 dark:text-rose-400">{totalFemale}</td>
            <td className="border-l px-6 py-2.5 text-center">{grandTotal}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
