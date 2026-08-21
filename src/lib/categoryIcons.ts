import {
  Smartphone,
  Sofa,
  Car,
  Refrigerator,
  Shirt,
  BookOpen,
  Home,
  Dumbbell,
  Baby,
  PawPrint,
  Gamepad2,
  Wrench,
  Watch,
  Gem,
  Bike,
  Guitar,
  Camera,
  Utensils,
  Briefcase,
  Palette,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  electronics: Smartphone,
  furniture: Sofa,
  vehicles: Car,
  appliances: Refrigerator,
  clothing: Shirt,
  books: BookOpen,
  home: Home,
  sports: Dumbbell,
  baby: Baby,
  pets: PawPrint,
  gaming: Gamepad2,
  tools: Wrench,
  watches: Watch,
  jewelry: Gem,
  bikes: Bike,
  music: Guitar,
  cameras: Camera,
  kitchen: Utensils,
  business: Briefcase,
  art: Palette,
};

export const CATEGORY_ICON_KEYS = Object.keys(CATEGORY_ICONS);

export function getCategoryIcon(key?: string | null): LucideIcon {
  if (!key || !(key in CATEGORY_ICONS)) return Home;
  return CATEGORY_ICONS[key];
}
