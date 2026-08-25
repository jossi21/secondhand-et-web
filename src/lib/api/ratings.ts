import { apiFetch } from "@/lib/api";
import type { RatingResponse } from "@/lib/types";

export interface SellerRatingSummary {
  average: number;
  count: number;
  ratings: RatingResponse[];
}

export function getSellerRatings(sellerId: string, signal?: AbortSignal) {
  return apiFetch<SellerRatingSummary>(`/ratings/seller/${sellerId}`, {
    signal,
  });
}

export interface RatingInput {
  toUserId: string;
  score: number;
  comment?: string;
}

export function createRating(input: RatingInput) {
  return apiFetch<RatingResponse>("/ratings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface UpdateRatingInput {
  score?: number;
  comment?: string;
}

export function updateRating(id: string, input: UpdateRatingInput) {
  return apiFetch<RatingResponse>(`/ratings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteRating(id: string) {
  return apiFetch<void>(`/ratings/${id}`, { method: "DELETE" });
}
