"use client";

import { createElement } from "react";
import { contactIcon, contactLabel, contactHref } from "@/lib/contactChannels";
import type { SellerContact } from "@/lib/types";

export function SellerContactLink({ contact }: { contact: SellerContact }) {
  const Icon = contactIcon(contact.type);
  const isPhone = contact.type.toLowerCase() === "phone";
  const label = contactLabel(contact.type);
  const href = contactHref(contact.type, contact.value);

  return createElement(
    "a",
    {
      href,
      target: isPhone ? undefined : "_blank",
      rel: "noopener noreferrer",
      className:
        "flex items-center justify-center gap-2 rounded-full bg-terracotta py-3 font-semibold text-white hover:bg-terracotta-dark",
    },
    createElement(Icon, { size: 18 }),
    createElement("span", null, `${label}: ${contact.value}`),
  );
}
