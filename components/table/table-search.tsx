"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type StoreApi, useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { SearchStoreSlice } from "./types";

const _noopStore = createStore<SearchStoreSlice>(() => ({
  search: "",
  setSearch: () => {},
}));

type TableSearchProps = {
  store?: StoreApi<SearchStoreSlice>;
  value?: string;
  onChange?: (value: string) => void;
  debounce?: number;
  placeholder?: string;
  className?: string;
};

export function TableSearch({
  store,
  value,
  onChange,
  debounce,
  placeholder = "Search...",
  className,
}: TableSearchProps) {
  const storeValue = useStore(store ?? _noopStore, (s) => s.search);
  const storeOnChange = useStore(store ?? _noopStore, (s) => s.setSearch);

  const externalValue = store !== undefined ? storeValue : (value ?? "");
  const externalOnChange =
    store !== undefined ? storeOnChange : (onChange ?? (() => {}));

  const [inputValue, setInputValue] = useState(externalValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onChangeRef = useRef(externalOnChange);
  useEffect(() => {
    onChangeRef.current = externalOnChange;
  });

  // Sync external resets (e.g. store cleared) back into the input
  useEffect(() => {
    setInputValue(externalValue);
    clearTimeout(timeoutRef.current);
  }, [externalValue]);

  const handleChange = (val: string) => {
    setInputValue(val);
    if (debounce === undefined) {
      onChangeRef.current(val);
    } else {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => onChangeRef.current(val), debounce);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Search
        aria-hidden="true"
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={16}
      />
      <Input
        className="pl-8"
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        value={inputValue}
      />
    </div>
  );
}
