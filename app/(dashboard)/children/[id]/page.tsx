import Link from "next/link"
import { ChevronLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ChildInfoCard } from "./components/child-info-card"
import { GrowthSection } from "./components/growth-section"
import { ImmunizationSection } from "./components/immunization-section"

type Props = {
  params: Promise<{ id: string }>
}

export default async function ChildDetailPage({ params }: Props) {
  const { id } = await params

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/children">
            <ChevronLeftIcon />
            Kembali
          </Link>
        </Button>
      </div>

      <ChildInfoCard childId={id} />
      <GrowthSection childId={id} />
      <ImmunizationSection childId={id} />
    </div>
  )
}
