import { apiFetch } from "@/lib/api";
import type { UserResponse } from "@/lib/types";

export interface SubmitNationalIdInput {
  nationalIdRef: string;
  nationalIdPhotoUrl: string;
}

export function submitNationalId(input: SubmitNationalIdInput) {
  return apiFetch<UserResponse>("/users/me/national-id", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
