export interface CategoryFormErrors {
  name?: string;
}

export function validateCategoryName(value: string): string | undefined {
  if (!value.trim()) return "Name is required.";
  if (value.trim().length < 2) return "Name is too short.";
  return undefined;
}

export interface CategoryFormValues {
  name: string;
  description: string;
  parentId: string;
}

export function validateCategoryForm(
  values: CategoryFormValues,
): CategoryFormErrors {
  const errors: CategoryFormErrors = {};
  const name = validateCategoryName(values.name);
  if (name) errors.name = name;
  return errors;
}
