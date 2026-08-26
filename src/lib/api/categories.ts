import { apiFetch } from "@/lib/api";
import { CategoryResponse } from "@/lib/types";

export interface CategoryInput {
  name: string;
  description?: string;
  parentId?: string;
  icon?: string;
}

export function listCategories(signal?: AbortSignal) {
  return apiFetch<CategoryResponse[]>("/categories/get-categories", {
    signal,
  });
}

export function createCategory(input: CategoryInput) {
  return apiFetch<CategoryResponse>("/categories/create-category", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCategory(id: string, input: CategoryInput) {
  return apiFetch<CategoryResponse>(`/categories/update-category${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteCategory(id: string) {
  return apiFetch<void>(`/categories/delete-category${id}`, {
    method: "DELETE",
  });
}
