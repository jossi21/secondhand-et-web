export interface ReportReasonOption {
  value: string;
  label: string;
  requiresDetails?: boolean;
}

export const REPORT_REASONS: ReportReasonOption[] = [
  { value: "Spam or misleading", label: "Spam or misleading" },
  { value: "Prohibited item", label: "Prohibited item" },
  { value: "Scam attempt", label: "Scam attempt" },
  { value: "Inappropriate content", label: "Inappropriate content" },
  { value: "Other", label: "Other", requiresDetails: true },
];
