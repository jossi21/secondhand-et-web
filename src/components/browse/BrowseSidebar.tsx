"use client";

import { CategoryResponse } from "@/lib/types";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { CONDITION_OPTIONS } from "@/lib/conditionLabels";

const CITIES = ["Any City", "Addis Ababa", "Hawassa", "Adama", "Dire Dawa"];

export function BrowseSidebar({
  categories,
  activeCategoryId,
  onCategoryChange,
  activeCondition,
  onConditionChange,
  activeCity,
  onCityChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  showSold,
  onToggleSold,
}: {
  categories: CategoryResponse[];
  activeCategoryId: string;
  onCategoryChange: (id: string) => void;
  activeCondition: string;
  onConditionChange: (v: string) => void;
  activeCity: string;
  onCityChange: (v: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
  showSold: boolean;
  onToggleSold: (v: boolean) => void;
}) {
  return (
    <aside className="hidden w-64 flex-shrink-0 lg:block">
      <h2 className="mb-4 text-lg font-bold text-gray-900">Filters</h2>

      <div className="mb-6">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
          Category
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange("")}
            className={`w-full rounded-lg px-4 py-2.5 text-left font-medium transition-all ${
              activeCategoryId === ""
                ? "bg-orange-700 text-white"
                : "text-gray-900 hover:bg-white"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isActive = activeCategoryId === cat.id;
            const Icon = getCategoryIcon(cat.icon ?? undefined);
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-left font-medium transition-all ${
                  isActive
                    ? "bg-orange-700 text-white"
                    : "text-gray-900 hover:bg-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
          City
        </h3>
        <div className="relative">
          <select
            value={activeCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-medium text-gray-900 focus:border-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-700/20"
          >
            {CITIES.map((city) => (
              <option key={city} value={city === "Any City" ? "" : city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
          Condition
        </h3>
        <div className="space-y-1">
          {CONDITION_OPTIONS.map((c) => {
            const isActive = activeCondition === c.value;
            return (
              <button
                key={c.label}
                onClick={() => onConditionChange(c.value)}
                className={`w-full rounded-lg px-4 py-2.5 text-left font-medium transition-all ${
                  isActive
                    ? "bg-orange-700 text-white"
                    : "text-gray-900 hover:bg-white"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
          Price Range (ETB)
        </h3>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-all focus:border-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-700/20"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-all focus:border-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-700/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="soldItems"
          checked={showSold}
          onChange={(e) => onToggleSold(e.target.checked)}
          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-orange-700 focus:ring-orange-700"
        />
        <label
          htmlFor="soldItems"
          className="cursor-pointer select-none font-medium text-gray-900"
        >
          Show sold items
        </label>
      </div>
    </aside>
  );
}
