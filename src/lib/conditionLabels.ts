export const CONDITION_LABELS: Record<string, string> = {
  brand_new: "Brand New",
  lightly_used: "Lightly Used",
  fair_condition: "Fair Condition",
};

export const CONDITION_OPTIONS = [
  { value: "", label: "Any Condition" },
  { value: "brand_new", label: "Brand New" },
  { value: "lightly_used", label: "Lightly Used" },
  { value: "fair_condition", label: "Fair Condition" },
];

export function conditionLabel(value: string): string {
  return CONDITION_LABELS[value] ?? value;
}
