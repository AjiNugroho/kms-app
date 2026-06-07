import { GrowthInputForm } from "./components/growth-input-form"

export default function KmsInputPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Input Data</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Input data tumbuh kembang anak secara satu per satu.
        </p>
      </div>
      <GrowthInputForm />
    </div>
  )
}
