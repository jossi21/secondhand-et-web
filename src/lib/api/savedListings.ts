import { apiFetch } from "@/lib/api";
import type { ToggleSavedListingResponse } from "@/lib/types";

export async function toggleSavedListing(
  listingId: string,
): Promise<ToggleSavedListingResponse> {
  return apiFetch<ToggleSavedListingResponse>(`/saved-listings/${listingId}`, {
    method: "PUT",
  });
}
