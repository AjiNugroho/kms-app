'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Child } from '../../datahooks/useChildren'

// ─── Growth ──────────────────────────────────────────────────────────────────

export type GrowthRecord = {
  id: string
  childId: string
  month: number
  weight: string | null
  length: string | null
  headCircumference: string | null
  status: 'up' | 'down' | 'stale' | null
  note: string | null
  createdAt: string
  updatedAt: string
}

export type GrowthInput = {
  weight?: string | null
  length?: string | null
  headCircumference?: string | null
  status?: 'up' | 'down' | 'stale' | null
  note?: string | null
}

// ─── Immunization ─────────────────────────────────────────────────────────────

export type ImmunizationRecord = {
  id: string
  childId: string
  type: 'vitamin' | 'vaksin'
  name: string
  date: string
  note: string | null
  createdAt: string
  updatedAt: string
}

export type ImmunizationInput = {
  type: 'vitamin' | 'vaksin'
  name: string
  date: string
  note?: string | null
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useChildById(id: string) {
  return useQuery<Child>({
    queryKey: ['child', id],
    queryFn: async () => {
      const res = await fetch(`/api/children/${id}`)
      if (!res.ok) throw new Error('Gagal memuat data anak')
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useChildGrowth(childId: string) {
  return useQuery<GrowthRecord[]>({
    queryKey: ['child-growth', childId],
    queryFn: async () => {
      const res = await fetch(`/api/children/${childId}/growth`)
      if (!res.ok) throw new Error('Gagal memuat data perkembangan')
      return res.json()
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  })
}

export function useUploadGrowth(childId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`/api/children/${childId}/growth/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Gagal mengimpor data')
      }
      return res.json() as Promise<{ upserted: number }>
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['child-growth', childId] }),
  })
}

export function useChildImmunization(childId: string) {
  return useQuery<ImmunizationRecord[]>({
    queryKey: ['child-immunization', childId],
    queryFn: async () => {
      const res = await fetch(`/api/children/${childId}/immunization`)
      if (!res.ok) throw new Error('Gagal memuat riwayat imunisasi')
      return res.json()
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateImmunization(childId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: ImmunizationInput) => {
      const res = await fetch(`/api/children/${childId}/immunization`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Gagal menyimpan data')
      }
      return res.json() as Promise<ImmunizationRecord>
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['child-immunization', childId] }),
  })
}

export function useUpdateImmunization(childId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ immuId, ...data }: ImmunizationInput & { immuId: string }) => {
      const res = await fetch(`/api/children/${childId}/immunization/${immuId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Gagal memperbarui data')
      }
      return res.json() as Promise<ImmunizationRecord>
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['child-immunization', childId] }),
  })
}

export function useDeleteImmunization(childId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (immuId: string) => {
      const res = await fetch(`/api/children/${childId}/immunization/${immuId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Gagal menghapus data')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['child-immunization', childId] }),
  })
}
