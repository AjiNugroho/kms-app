'use client'

import { useState } from "react"
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { type ImmunizationRecord, useChildImmunization } from "../datahooks/useChildDetail"
import { ImmunizationCreateModal } from "./immunization-create-modal"
import { ImmunizationEditModal } from "./immunization-edit-modal"
import { ImmunizationDeleteModal } from "./immunization-delete-modal"

type ModalState =
  | { type: "edit"; record: ImmunizationRecord }
  | { type: "delete"; record: ImmunizationRecord }
  | null

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

type Props = { childId: string }

export function ImmunizationSection({ childId }: Props) {
  const { data, isLoading, isError } = useChildImmunization(childId)
  const [modal, setModal] = useState<ModalState>(null)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Riwayat Vitamin & Imunisasi</CardTitle>
          <ImmunizationCreateModal childId={childId} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Catatan</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-destructive">
                  Gagal memuat riwayat imunisasi.
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && (!data || data.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Belum ada riwayat vitamin atau imunisasi.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !isError &&
              data?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDate(record.date)}</TableCell>
                  <TableCell>
                    <Badge variant={record.type === "vitamin" ? "secondary" : record.type === "obat" ? "destructive" : "outline"}>
                      {record.type === "vitamin" ? "Vitamin" : record.type === "obat" ? "Obat" : "Vaksin"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{record.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-48 truncate">
                    {record.note ?? "—"}
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
                          onClick={() => setModal({ type: "edit", record })}
                        >
                          <PencilIcon />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setModal({ type: "delete", record })}
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

        {modal?.type === "edit" && (
          <ImmunizationEditModal
            childId={childId}
            record={modal.record}
            open
            onOpenChange={(v) => { if (!v) setModal(null) }}
          />
        )}
        {modal?.type === "delete" && (
          <ImmunizationDeleteModal
            childId={childId}
            record={modal.record}
            open
            onOpenChange={(v) => { if (!v) setModal(null) }}
          />
        )}
      </CardContent>
    </Card>
  )
}
