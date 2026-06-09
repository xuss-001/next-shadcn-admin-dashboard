"use client";

import * as React from "react";

import { useSessionStorageState } from "@/hooks/use-session-storage-state";

type EcommercePeriod = "this-month" | "last-month" | "last-30-days" | "year-to-date";
type EcommerceChannel = "all-channels" | "online-store" | "marketplace" | "social" | "retail";

interface EcommerceFilters {
  period: EcommercePeriod;
  channel: EcommerceChannel;
}

interface EcommerceFiltersContextValue extends EcommerceFilters {
  setPeriod: (period: EcommercePeriod) => void;
  setChannel: (channel: EcommerceChannel) => void;
}

const EcommerceFiltersContext = React.createContext<EcommerceFiltersContextValue | null>(null);

const STORAGE_KEY = "ecommerce-filters";
const DEFAULT_FILTERS: EcommerceFilters = {
  period: "this-month",
  channel: "all-channels",
};

export function EcommerceFiltersProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useSessionStorageState<EcommerceFilters>(STORAGE_KEY, DEFAULT_FILTERS);

  const setPeriod = React.useCallback(
    (period: EcommercePeriod) => {
      setFilters((prev) => ({ ...prev, period }));
    },
    [setFilters],
  );

  const setChannel = React.useCallback(
    (channel: EcommerceChannel) => {
      setFilters((prev) => ({ ...prev, channel }));
    },
    [setFilters],
  );

  const value = React.useMemo(
    () => ({
      ...filters,
      setPeriod,
      setChannel,
    }),
    [filters, setPeriod, setChannel],
  );

  return <EcommerceFiltersContext.Provider value={value}>{children}</EcommerceFiltersContext.Provider>;
}

export function useEcommerceFilters() {
  const context = React.useContext(EcommerceFiltersContext);
  if (!context) {
    throw new Error("useEcommerceFilters must be used within an EcommerceFiltersProvider");
  }
  return context;
}

export type { EcommerceChannel, EcommerceFilters, EcommercePeriod };
