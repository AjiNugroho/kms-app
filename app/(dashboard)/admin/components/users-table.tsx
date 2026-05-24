'use client'

import { useState } from "react"
import { MoreHorizontalIcon, PencilIcon, KeyRoundIcon, Trash2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAdminListData, type UserShown } from "../datahooks/useUserAdminList"
import { UserCreateModal } from "./user-create-modal"
import { UserEditModal } from "./user-edit-modal"
import { UserDeleteModal } from "./user-delete-modal"
import { UserPasswordModal } from "./user-password-modal"



function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

type ModalState =
  | { type: "edit"; user: UserShown }
  | { type: "delete"; user: UserShown }
  | { type: "password"; user: UserShown }
  | null

export function UsersTable() {
  const { data, isLoading, isError } = useAdminListData()
  const [modal, setModal] = useState<ModalState>(null)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {!isLoading && !isError && (
            <>Total <strong>{data?.total ?? 0}</strong> pengguna</>
          )}
        </p>
        <UserCreateModal />
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Peran</TableHead>
            <TableHead>Terdaftar</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell />
              </TableRow>
            ))}

          {isError && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-destructive">
                Gagal memuat data pengguna.
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !isError && data?.users?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Tidak ada pengguna ditemukan.
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            !isError &&
            data?.users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <MoreHorizontalIcon />
                        <span className="sr-only">Buka menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setModal({ type: "edit", user })}
                      >
                        <PencilIcon />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setModal({ type: "password", user })}
                      >
                        <KeyRoundIcon />
                        Ubah Password
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setModal({ type: "delete", user })}
                      >
                        <Trash2Icon />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {/* Modals — rendered outside the table to avoid DOM nesting issues */}
      {modal?.type === "edit" && (
        <UserEditModal
          user={modal.user}
          open
          onOpenChange={(v) => { if (!v) setModal(null) }}
        />
      )}
      {modal?.type === "delete" && (
        <UserDeleteModal
          user={modal.user}
          open
          onOpenChange={(v) => { if (!v) setModal(null) }}
        />
      )}
      {modal?.type === "password" && (
        <UserPasswordModal
          user={modal.user}
          open
          onOpenChange={(v) => { if (!v) setModal(null) }}
        />
      )}
    </div>
  )
}
