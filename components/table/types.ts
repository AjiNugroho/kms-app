export interface SearchStoreSlice {
  search: string;
  setSearch: (search: string) => void;
}

export interface PageSizeStoreSlice {
  perPage: number;
  setPerPage: (perPage: number) => void;
}

export interface PaginationStoreSlice {
  page: number;
  setPage: (page: number) => void;
}

export interface TableStoreState
  extends SearchStoreSlice,
    PageSizeStoreSlice,
    PaginationStoreSlice {}

/** Normalized pagination metadata returned by all data hooks, regardless of the API's field names. */
export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
