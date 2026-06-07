import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersIcon, UserIcon, BabyIcon } from "lucide-react"

type Props = {
  total: number
  male: number
  female: number
}

export function SummaryCards({ total, male, female }: Props) {
  const malePct   = total > 0 ? Math.round((male / total) * 100) : 0
  const femalePct = total > 0 ? Math.round((female / total) * 100) : 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Anak</CardTitle>
          <UsersIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{total}</p>
          <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="bg-blue-400" style={{ width: `${malePct}%` }} />
            <div className="bg-rose-400" style={{ width: `${femalePct}%` }} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 dark:border-blue-900">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Laki-laki</CardTitle>
          <div className="flex size-7 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <UserIcon className="size-3.5 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{male}</p>
          <p className="mt-1 text-xs text-muted-foreground">{malePct}% dari total</p>
        </CardContent>
      </Card>

      <Card className="border-rose-200 dark:border-rose-900">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Perempuan</CardTitle>
          <div className="flex size-7 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900">
            <BabyIcon className="size-3.5 text-rose-500" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{female}</p>
          <p className="mt-1 text-xs text-muted-foreground">{femalePct}% dari total</p>
        </CardContent>
      </Card>
    </div>
  )
}
