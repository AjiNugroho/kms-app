"use client";

import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { type StoreApi, useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import type { PaginationStoreSlice } from "./types";

const _noopStore = createStore<PaginationStoreSlice>(() => ({
  page: 1,
  setPage: () => {},
}));

type TablePaginationProps = {
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  store?: StoreApi<PaginationStoreSlice>;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
};

export function TablePagination({
  totalPages,
  totalItems,
  pageSize,
  store,
  currentPage,
  onPageChange,
  className,
}: TablePaginationProps) {
  const storePage = useStore(store ?? _noopStore, (s) => s.page);
  const storeSetPage = useStore(store ?? _noopStore, (s) => s.setPage);

  const page = store !== undefined ? storePage : (currentPage ?? 1);
  const setPage =
    store !== undefined ? storeSetPage : (onPageChange ?? (() => {}));

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: page,
    totalPages,
    paginationItemsToDisplay: 5,
  });

  const rangeStart =
    totalItems !== undefined && pageSize !== undefined
      ? (page - 1) * pageSize + 1
      : undefined;
  const rangeEnd =
    totalItems !== undefined && pageSize !== undefined
      ? Math.min(page * pageSize, totalItems)
      : undefined;

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {totalItems !== undefined && rangeStart !== undefined && rangeEnd !== undefined ? (
        <p
          aria-live="polite"
          className="whitespace-nowrap text-muted-foreground text-sm"
        >
          <span className="text-foreground">
            {rangeStart}–{rangeEnd}
          </span>{" "}
          of{" "}
          <span className="text-foreground">{totalItems}</span>
        </p>
      ) : (
        <p
          aria-live="polite"
          className="whitespace-nowrap text-muted-foreground text-sm"
        >
          Page <span className="text-foreground">{page}</span> of{" "}
          <span className="text-foreground">{totalPages}</span>
        </p>
      )}

      <Pagination className="w-fit mx-0">
        <PaginationContent>
          <PaginationItem>
            <Button
              aria-label="Go to first page"
              disabled={!canPrev}
              onClick={() => setPage(1)}
              size="icon"
              variant="outline"
            >
              <ChevronFirstIcon aria-hidden="true" size={16} />
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button
              aria-label="Go to previous page"
              disabled={!canPrev}
              onClick={() => setPage(page - 1)}
              size="icon"
              variant="outline"
            >
              <ChevronLeftIcon aria-hidden="true" size={16} />
            </Button>
          </PaginationItem>
          {showLeftEllipsis && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {pages.map((p) => (
            <PaginationItem key={p}>
              <PaginationLink
                isActive={p === page}
                onClick={() => setPage(p)}
                className="cursor-pointer"
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}

          {showRightEllipsis && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <Button
              aria-label="Go to next page"
              disabled={!canNext}
              onClick={() => setPage(page + 1)}
              size="icon"
              variant="outline"
            >
              <ChevronRightIcon aria-hidden="true" size={16} />
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button
              aria-label="Go to last page"
              disabled={!canNext}
              onClick={() => setPage(totalPages)}
              size="icon"
              variant="outline"
            >
              <ChevronLastIcon aria-hidden="true" size={16} />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
