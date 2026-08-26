"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CategoryResponse } from "@/lib/types";
import { listCategories } from "@/lib/api/categories";

export function useCategories() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const reload = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    try {
      const data = await listCategories(controller.signal);
      setCategories(data);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    return () => abortRef.current?.abort();
  }, [reload]);

  return { categories, isLoading, reload };
}
