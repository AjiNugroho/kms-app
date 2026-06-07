import { useMemo } from "react"

type UsePaginationOptions = {
  currentPage: number
  totalPages: number
  paginationItemsToDisplay?: number
}

type UsePaginationResult = {
  pages: number[]
  showLeftEllipsis: boolean
  showRightEllipsis: boolean
}

export function usePagination({
  currentPage,
  totalPages,
  paginationItemsToDisplay = 5,
}: UsePaginationOptions): UsePaginationResult {
  return useMemo(() => {
    if (totalPages <= paginationItemsToDisplay) {
      return {
        pages: Array.from({ length: totalPages }, (_, i) => i + 1),
        showLeftEllipsis: false,
        showRightEllipsis: false,
      }
    }

    const half = Math.floor(paginationItemsToDisplay / 2)
    let start = Math.max(1, currentPage - half)
    let end = start + paginationItemsToDisplay - 1

    if (end > totalPages) {
      end = totalPages
      start = Math.max(1, end - paginationItemsToDisplay + 1)
    }

    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

    return {
      pages,
      showLeftEllipsis: start > 1,
      showRightEllipsis: end < totalPages,
    }
  }, [currentPage, totalPages, paginationItemsToDisplay])
}
