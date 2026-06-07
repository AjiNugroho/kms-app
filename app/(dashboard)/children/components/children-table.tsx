'use client'

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type ColumnFiltersState,
  type PaginationState,
} from "@tanstack/react-table"
import { MoreHorizontalIcon, PencilIcon, Trash2Icon, SearchIcon, EyeIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useChildren, type Child } from "../datahooks/useChildren"
import { ChildCreateModal } from "./child-create-modal"
import { ChildBulkModal } from "./child-bulk-modal"
import { ChildEditModal } from "./child-edit-modal"
import { ChildDeleteModal } from "./child-delete-modal"

type ModalState =
  | { type: "edit"; child: Child }
  | { type: "delete"; child: Child }
  | null

function calcAgeMonths(bornDate: string): number {
  const born = new Date(bornDate)
  const today = new Date()
  let months =
    (today.getFullYear() - born.getFullYear()) * 12 +
    (today.getMonth() - born.getMonth())
  if (today.getDate() < born.getDate()) months--
  return Math.max(0, months)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const columnHelper = createColumnHelper<Child>()

export function ChildrenTable() {
  const router = useRouter()
  const { data, isLoading, isError } = useChildren()
  const [modal, setModal] = useState<ModalState>(null)
  const [searchInput, setSearchInput] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "no",
        header: "No",
        cell: (info) =>
          info.table.getState().pagination.pageIndex *
            info.table.getState().pagination.pageSize +
          info.row.index +
          1,
      }),
      columnHelper.accessor("name", {
        header: "Nama Anak",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
        filterFn: "includesString",
      }),
      columnHelper.accessor("bornDate", {
        header: "Tgl. Lahir",
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.display({
        id: "age",
        header: "Usia (bln)",
        cell: (info) => calcAgeMonths(info.row.original.bornDate),
      }),
      columnHelper.accessor("gender", {
        header: "Jenis Kelamin",
        cell: (info) => info.getValue() === "laki-laki" ? "Laki-laki" : "Perempuan",
      }),
      columnHelper.accessor("fatherName", {
        header: "Nama Ayah",
      }),
      columnHelper.accessor("motherName", {
        header: "Nama Ibu",
      }),
      columnHelper.accessor("address", {
        header: "Alamat",
        cell: (info) => (
          <span className="line-clamp-1 max-w-48 text-muted-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("bornWeight", {
        header: "BB Lahir (kg)",
        cell: (info) => parseFloat(info.getValue()).toFixed(2),
      }),
      columnHelper.accessor("bornLength", {
        header: "PB Lahir (cm)",
        cell: (info) => parseFloat(info.getValue()).toFixed(1),
      }),
      columnHelper.accessor("bornCircumference", {
        header: "LK Lahir (cm)",
        cell: (info) => parseFloat(info.getValue()).toFixed(1),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                <MoreHorizontalIcon />
                <span className="sr-only">Buka menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/children/${info.row.original.id}`}>
                  <EyeIcon />
                  Lihat Detail
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setModal({ type: "edit", child: info.row.original })}
              >
                <PencilIcon />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setModal({ type: "delete", child: info.row.original })}
              >
                <Trash2Icon />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }),
    ],
    []
  )

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { columnFilters, pagination },
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  function handleSearch() {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
    setColumnFilters(searchInput.trim() ? [{ id: "name", value: searchInput.trim() }] : [])
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch()
  }

  function handleSearchClear() {
    setSearchInput("")
    setColumnFilters([])
  }

  const totalFiltered = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = table.getPageCount()

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Cari nama anak..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-56"
          />
          <Button variant="secondary" onClick={handleSearch}>
            <SearchIcon />
            Cari
          </Button>
          {columnFilters.length > 0 && (
            <Button size="sm" variant="ghost" onClick={handleSearchClear}>
              Reset
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ChildBulkModal />
          <ChildCreateModal />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-destructive">
                  Gagal memuat data anak.
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground"
                >
                  {columnFilters.length > 0
                    ? "Tidak ada anak yang cocok dengan pencarian."
                    : "Belum ada data anak."}
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !isError &&
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/children/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={cell.column.id === "actions" ? (e) => e.stopPropagation() : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer: count + rows-per-page + pagination */}
      {!isLoading && !isError && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <p>
              {totalFiltered > 0 ? (
                <>
                  Menampilkan <strong>{Math.min(pageIndex * pageSize + 1, totalFiltered)}</strong>–
                  <strong>{Math.min((pageIndex + 1) * pageSize, totalFiltered)}</strong> dari{" "}
                  <strong>{totalFiltered}</strong> anak
                </>
              ) : (
                "Tidak ada data"
              )}
            </p>
            <div className="hidden xl:flex xl:items-center gap-2">
              <span className="whitespace-nowrap">Baris per halaman:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPagination({ pageIndex: 0, pageSize: Number(v) })
                }}
              >
                <SelectTrigger className="h-8 w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {pageCount > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                «
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                ‹
              </Button>
              <span>
                Halaman <strong>{pageIndex + 1}</strong> dari <strong>{pageCount}</strong>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                ›
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(pageCount - 1)}
                disabled={!table.getCanNextPage()}
              >
                »
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {modal?.type === "edit" && (
        <ChildEditModal
          child={modal.child}
          open
          onOpenChange={(v) => { if (!v) setModal(null) }}
        />
      )}
      {modal?.type === "delete" && (
        <ChildDeleteModal
          child={modal.child}
          open
          onOpenChange={(v) => { if (!v) setModal(null) }}
        />
      )}
    </div>
  )
}
