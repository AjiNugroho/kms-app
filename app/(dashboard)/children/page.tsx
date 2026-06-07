import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChildrenTable } from "./components/children-table"

export default function ChildrenPage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Anak</CardTitle>
        </CardHeader>
        <CardContent>
          <ChildrenTable />
        </CardContent>
      </Card>
    </div>
  )
}
