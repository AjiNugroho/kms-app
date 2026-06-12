import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UsersTable } from './components/users-table'

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const role = (session?.user as { role?: string } | null)?.role

  if (!session || role !== "superadmin") redirect("/")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Administrator</CardTitle>
        <CardDescription>
          Halaman ini digunakan untuk mengelola daftar admin yang memiliki akses ke dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UsersTable/>
      </CardContent>
    </Card>
  )
}
