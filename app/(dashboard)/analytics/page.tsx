import { SummarySection, DistributionTable } from "./components/dashboard-analytics"
import { AdvancedAnalytics } from "./components/advanced-analytics"

export default function HomePage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Statistik Anak</h1>
      <SummarySection />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-none">
          <DistributionTable />
        </div>
        <div className="min-w-0 flex-1">
          <AdvancedAnalytics />
        </div>
      </div>
    </div>
  )
}
