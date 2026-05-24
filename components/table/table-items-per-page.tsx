"use client";

import { type StoreApi, useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PageSizeStoreSlice } from "./types";

const _noopStore = createStore<PageSizeStoreSlice>(() => ({
  perPage: 10,
  setPerPage: () => {},
}));

const DEFAULT_OPTIONS = [10, 25, 50, 100];

type TableItemsPerPageProps = {
  store?: StoreApi<PageSizeStoreSlice>;
  value?: number;
  onChange?: (value: number) => void;
  options?: number[];
  label?: string;
  id?: string;
  className?: string;
};

export function TableItemsPerPage({
  store,
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  label = "Rows per page",
  id = "items-per-page",
  className,
}: TableItemsPerPageProps) {
  const storeValue = useStore(store ?? _noopStore, (s) => s.perPage);
  const storeOnChange = useStore(store ?? _noopStore, (s) => s.setPerPage);

  const finalValue = store !== undefined ? storeValue : (value ?? 10);
  const finalOnChange =
    store !== undefined ? storeOnChange : (onChange ?? (() => {}));

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Label className="max-sm:sr-only whitespace-nowrap" htmlFor={id}>
        {label}
      </Label>
      <Select
        onValueChange={(v) => finalOnChange(Number(v))}
        value={finalValue.toString()}
      >
        <SelectTrigger className="w-fit whitespace-nowrap" id={id}>
          <SelectValue placeholder="Select rows" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt.toString()}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
