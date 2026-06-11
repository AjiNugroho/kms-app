import { SummarySection, DistributionTable } from "./components/dashboard-analytics"
import { AdvancedAnalytics } from "./components/advanced-analytics"
import { NutritionStatusTables } from "./components/status-distribution"

export default function HomePage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Statistik Anak</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ringkasan data tumbuh kembang seluruh anak binaan.
        </p>
      </div>

      {/* Overview */}
      <SummarySection />

      {/* Nutritional & height status */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Status Pertumbuhan</h2>
          <p className="text-xs text-muted-foreground">
            Klasifikasi z-score WHO berdasarkan pengukuran terakhir masing-masing anak.
          </p>
        </div>
        <NutritionStatusTables />
      </section>

      {/* Activity metrics */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Rekap Pengukuran</h2>
          <p className="text-xs text-muted-foreground">
            Distribusi hasil penimbangan berdasarkan kategori usia.
          </p>
        </div>
        <AdvancedAnalytics />
      </section>

      {/* Age demographics */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Distribusi Usia</h2>
          <p className="text-xs text-muted-foreground">
            Jumlah anak binaan berdasarkan kelompok usia saat ini.
          </p>
        </div>
        <DistributionTable />
      </section>
    </div>
  )
}
