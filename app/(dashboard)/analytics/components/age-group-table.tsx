import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type AgeGroupData = {
  label: string
  male: number
  female: number
  total: number
}

type Props = {
  title: string
  groups: AgeGroupData[]
  cardClassName?: string
}

export function AgeGroupTable({ title, groups, cardClassName = "w-full" }: Props) {
  const totalMale   = groups.reduce((s, g) => s + g.male, 0)
  const totalFemale = groups.reduce((s, g) => s + g.female, 0)
  const grandTotal  = totalMale + totalFemale

  return (
    <Card className={cardClassName}>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-sm sm:text-base">{title}</CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block size-2 rounded-full bg-blue-400" />
              ♂
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block size-2 rounded-full bg-rose-400" />
              ♀
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ul className="divide-y">
          {groups.map((g) => (
            <li key={g.label} className="flex items-center gap-3 px-4 py-2 sm:gap-8 sm:px-6 sm:py-2.5">
              <span className="w-24 shrink-0 text-xs text-muted-foreground sm:w-36 sm:text-sm">{g.label}</span>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex min-w-10 items-center justify-center gap-1 rounded-lg bg-blue-50 px-2 py-1 sm:min-w-14 sm:px-3 sm:py-1.5 dark:bg-blue-950">
                  <span className="text-base font-bold text-blue-600 sm:text-xl dark:text-blue-400">{g.male}</span>
                  <span className="text-xs font-medium text-blue-400">♂</span>
                </div>

                <div className="flex min-w-10 items-center justify-center gap-1 rounded-lg bg-rose-50 px-2 py-1 sm:min-w-14 sm:px-3 sm:py-1.5 dark:bg-rose-950">
                  <span className="text-base font-bold text-rose-600 sm:text-xl dark:text-rose-400">{g.female}</span>
                  <span className="text-xs font-medium text-rose-400">♀</span>
                </div>
              </div>

              <span className="w-6 text-right text-xs text-muted-foreground sm:w-10 sm:text-sm">{g.total}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 border-t-2 bg-muted/40 px-4 py-2 sm:gap-8 sm:px-6 sm:py-2.5">
          <span className="w-24 shrink-0 text-xs font-semibold sm:w-36 sm:text-sm">Total</span>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex min-w-10 items-center justify-center gap-1 rounded-lg bg-blue-50 px-2 py-1 sm:min-w-14 sm:px-3 sm:py-1.5 dark:bg-blue-950">
              <span className="text-base font-bold text-blue-600 sm:text-xl dark:text-blue-400">{totalMale}</span>
              <span className="text-xs font-medium text-blue-400">♂</span>
            </div>
            <div className="flex min-w-10 items-center justify-center gap-1 rounded-lg bg-rose-50 px-2 py-1 sm:min-w-14 sm:px-3 sm:py-1.5 dark:bg-rose-950">
              <span className="text-base font-bold text-rose-600 sm:text-xl dark:text-rose-400">{totalFemale}</span>
              <span className="text-xs font-medium text-rose-400">♀</span>
            </div>
          </div>
          <span className="w-6 text-right text-xs font-semibold sm:w-10 sm:text-sm">{grandTotal}</span>
        </div>
      </CardContent>
    </Card>
  )
}
