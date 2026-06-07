'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export type Child = {
  id: string
  name: string
  bornDate: string
  gender: "laki-laki" | "perempuan"
  fatherName: string
  motherName: string
  address: string
  bornWeight: string
  bornLength: string
  createdAt: string
  updatedAt: string
}

export type ChildInput = Omit<Child, 'id' | 'createdAt' | 'updatedAt'>

const QUERY_KEY = ['children']

export function useChildren() {
  return useQuery<Child[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await fetch('/api/children')
      if (!res.ok) throw new Error('Gagal memuat data anak')
      return res.json()
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateChild() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: ChildInput) => {
      const res = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Gagal menyimpan data')
      }
      return res.json() as Promise<Child>
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useUpdateChild() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: ChildInput & { id: string }) => {
      const res = await fetch(`/api/children/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Gagal memperbarui data')
      }
      return res.json() as Promise<Child>
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useDeleteChild() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/children/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus data')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useBulkImportChildren() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/children/bulk', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Gagal mengimpor data')
      }
      return res.json() as Promise<{ inserted: number }>
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
