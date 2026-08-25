import {
  MessageCircle,
  Phone,
  Mail,
  Send,
  type LucideIcon,
} from "lucide-react";

// Selectable contact types when a seller picks their contact methods.
// Must match the backend ContactType enum exactly (phone, telegram, whatsapp).
export const CONTACT_TYPES = ["phone", "whatsapp", "telegram"] as const;

export const MAX_CONTACTS = 5;

const CHANNEL_ICONS: Record<string, LucideIcon> = {
  phone: Phone,
  whatsapp: MessageCircle,
  telegram: Send,
  email: Mail,
};

const CHANNEL_LABELS: Record<string, string> = {
  phone: "Phone",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  email: "Email",
};

export function contactIcon(type: string): LucideIcon {
  return CHANNEL_ICONS[type.toLowerCase()] ?? MessageCircle;
}

export function contactLabel(type: string): string {
  return CHANNEL_LABELS[type.toLowerCase()] ?? type;
}

export function contactHref(type: string, value: string): string {
  switch (type.toLowerCase()) {
    case "phone":
      return `tel:${value}`;
    case "whatsapp":
      return `https://wa.me/${value.replace(/[^\d]/g, "")}`;
    case "telegram":
      return `https://t.me/${value.replace(/^@/, "")}`;
    case "email":
      return `mailto:${value}`;
    default:
      return value;
  }
}
