import { apiFetch } from "@/lib/api";
import { ListingResponse, PaginatedListingResponse } from "@/lib/types";

export interface ListingSearchFilters {
  q?: string;
  categoryId?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: "active" | "sold" | "removed" | "all";
  page?: number;
  limit?: number;
}

export function searchListings(
  filters: ListingSearchFilters,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.city) params.set("city", filters.city);
  if (filters.minPrice !== undefined)
    params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined)
    params.set("maxPrice", String(filters.maxPrice));
  if (filters.status) params.set("status", filters.status);
  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 24));

  return apiFetch<PaginatedListingResponse>(`/listings?${params.toString()}`, {
    signal,
  });
}

export function getListing(id: string, signal?: AbortSignal) {
  return apiFetch<ListingResponse>(`/listings/${id}`, { signal });
}

export interface CreateListingInput {
  title: string;
  description: string;
  price: number;
  condition: string;
  city: string;
  neighborhood?: string;
  categoryId: string;
  imageUrls?: string[];
}

export function createListing(input: CreateListingInput) {
  return apiFetch<ListingResponse>("/listings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface UpdateListingInput {
  title?: string;
  description?: string;
  price?: number;
  condition?: string;
  city?: string;
  neighborhood?: string;
  categoryId?: string;
  imageUrls?: string[];
  status?: "active" | "sold" | "removed";
}

export function updateListing(id: string, input: UpdateListingInput) {
  return apiFetch<ListingResponse>(`/listings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteListing(id: string) {
  return apiFetch<void>(`/listings/${id}`, { method: "DELETE" });
}
