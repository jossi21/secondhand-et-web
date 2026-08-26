"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ListingResponse } from "@/lib/types";
import { searchListings, type ListingSearchFilters } from "@/lib/api/listings";

export function useListings(filters: ListingSearchFilters) {
  const [listings, setListings] = useState<ListingResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  // Stable key so effect deps don't churn on a new object identity every render
  const key = JSON.stringify(filters);

  const reload = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    try {
      const result = await searchListings(filters, controller.signal);
      setListings(result.data);
      setTotal(result.total);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setListings([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    reload();
    return () => abortRef.current?.abort();
  }, [reload]);

  return { listings, total, isLoading, reload };
}
