"use client";

import { createElement } from "react";
import { contactIcon, contactLabel, contactHref } from "@/lib/contactChannels";
import type { SellerContact } from "@/lib/types";

type ContactVariant = "bold" | "equal" | "subtle";

export function SellerContactLink({
  contact,
  variant = "bold",
}: {
  contact: SellerContact;
  variant?: ContactVariant;
}) {
  const Icon = contactIcon(contact.type);
  const isPhone = contact.type.toLowerCase() === "phone";
  const label = contactLabel(contact.type);
  const href = contactHref(contact.type, contact.value);

  // Color mapping for different contact types (bold variant)
  const getBoldColorClasses = (type: string) => {
    const normalized = type.toLowerCase();
    switch (normalized) {
      case "phone":
        return "bg-green-600 hover:bg-green-700";
      case "email":
        return "bg-blue-600 hover:bg-blue-700";
      case "telegram":
        return "bg-sky-500 hover:bg-sky-600";
      case "whatsapp":
        return "bg-emerald-500 hover:bg-emerald-600";
      default:
        return "bg-terracotta hover:bg-terracotta-dark";
    }
  };

  // Color mapping for different contact types (subtle variant)
  const getSubtleColorClasses = (type: string) => {
    const normalized = type.toLowerCase();
    switch (normalized) {
      case "phone":
        return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
      case "email":
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
      case "telegram":
        return "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100";
      case "whatsapp":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
      default:
        return "bg-terracotta-tint text-terracotta border-terracotta/30 hover:bg-terracotta-tint/80";
    }
  };

  // Icon background color for subtle variant
  const getIconBgClass = (type: string) => {
    const normalized = type.toLowerCase();
    switch (normalized) {
      case "phone":
        return "bg-green-100 text-green-700";
      case "email":
        return "bg-blue-100 text-blue-700";
      case "telegram":
        return "bg-sky-100 text-sky-700";
      case "whatsapp":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-terracotta-tint text-terracotta";
    }
  };

  // Version 1: Bold solid colors with white text
  if (variant === "bold") {
    return createElement(
      "a",
      {
        href,
        target: isPhone ? undefined : "_blank",
        rel: "noopener noreferrer",
        className: `flex items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 font-medium text-white transition-all hover:shadow-lg hover:-translate-y-0.5 ${getBoldColorClasses(contact.type)}`,
      },
      createElement(Icon, { size: 18, className: "text-white" }),
      createElement(
        "span",
        { className: "text-sm font-semibold" },
        contact.value,
      ),
    );
  }

  // Version 2: Equal width distribution
  if (variant === "equal") {
    return createElement(
      "a",
      {
        href,
        target: isPhone ? undefined : "_blank",
        rel: "noopener noreferrer",
        className: `flex flex-1 items-center justify-center gap-3 rounded-xl px-4 py-3.5 font-medium text-white transition-all hover:shadow-lg hover:-translate-y-0.5 min-w-[120px] ${getBoldColorClasses(contact.type)}`,
      },
      createElement(Icon, { size: 18, className: "text-white" }),
      createElement(
        "span",
        { className: "text-sm font-semibold" },
        contact.value,
      ),
    );
  }

  // Version 3: Subtle card-like design
  return createElement(
    "a",
    {
      href,
      target: isPhone ? undefined : "_blank",
      rel: "noopener noreferrer",
      className: `flex flex-1 items-center justify-center gap-3 rounded-xl border-2 px-4 py-3.5 font-medium transition-all hover:shadow-md hover:-translate-y-0.5 min-w-[120px] ${getSubtleColorClasses(contact.type)}`,
    },
    createElement(
      "div",
      {
        className: `flex h-9 w-9 items-center justify-center rounded-lg ${getIconBgClass(contact.type)}`,
      },
      createElement(Icon, { size: 16 }),
    ),
    createElement(
      "span",
      { className: "text-sm font-semibold" },
      contact.value,
    ),
  );
}
