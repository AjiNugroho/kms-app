import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'
import { UsersTable } from './components/users-table'

const page = () => {
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

export default page
