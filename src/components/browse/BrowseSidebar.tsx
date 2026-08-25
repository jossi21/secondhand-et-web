"use client";

import { useState, useRef, useEffect } from "react";
import { CategoryResponse } from "@/lib/types";
import {
  FolderTree,
  DollarSign,
  Tag,
  MapPin,
  CircleDot,
  ChevronDown,
  ChevronRight,
  Search,
  X,
} from "lucide-react";

// Updated conditions based on your enum
const CONDITIONS = [
  { value: "brand_new", label: "Brand New" },
  { value: "lightly_used", label: "Lightly Used" },
  { value: "fair_condition", label: "Fair Condition" },
];

interface BrowseSidebarProps {
  categories: CategoryResponse[];
  activeCategoryId: string;
  onCategoryChange: (id: string) => void;
  activeCondition: string;
  onConditionChange: (condition: string) => void;
  activeCity: string;
  onCityChange: (city: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  showSold: boolean;
  onToggleSold: (show: boolean) => void;
  isCollapsed?: boolean;
}

// Popular cities for suggestions
const POPULAR_CITIES = [
  "Addis Ababa",
  "Hawassa",
  "Adama",
  "Bahir Dar",
  "Mekelle",
  "Dire Dawa",
  "Gondar",
  "Jimma",
  "Debre Zeit",
  "Dessie",
  "Harar",
];

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
  isCollapsed = false,
}: BrowseSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    categories: false,
    price: false,
    condition: false,
    location: false,
    status: false,
  });

  // Use activeCity as the source of truth for the input
  const [locationInput, setLocationInput] = useState(activeCity || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Update input when activeCity changes from parent (only if not internal)
  useEffect(() => {
    if (!isInternalUpdate.current) {
      setLocationInput(activeCity || "");
    }
    isInternalUpdate.current = false;
  }, [activeCity]);

  // Filter suggestions based on input - debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationInput.trim().length > 0) {
        const filtered = POPULAR_CITIES.filter((city) =>
          city.toLowerCase().includes(locationInput.toLowerCase()),
        );
        setSuggestions(filtered.slice(0, 5));
        setShowSuggestions(filtered.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [locationInput]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const clearAllFilters = () => {
    onCategoryChange("");
    onConditionChange("");
    onCityChange("");
    onMinPriceChange("");
    onMaxPriceChange("");
    onToggleSold(false);
    isInternalUpdate.current = true;
    setLocationInput("");
    setShowSuggestions(false);
  };

  const handleLocationSelect = (city: string) => {
    isInternalUpdate.current = true;
    setLocationInput(city);
    onCityChange(city);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    isInternalUpdate.current = true;
    setLocationInput(value);
    // If the input is cleared, also clear the filter
    if (value.trim() === "") {
      onCityChange("");
    }
  };

  const handleLocationBlur = () => {
    // If input has a value, apply it
    if (locationInput.trim()) {
      // Check if it matches a popular city (case insensitive)
      const match = POPULAR_CITIES.find(
        (city) => city.toLowerCase() === locationInput.toLowerCase().trim(),
      );
      if (match) {
        isInternalUpdate.current = true;
        setLocationInput(match);
        onCityChange(match);
      } else {
        isInternalUpdate.current = true;
        onCityChange(locationInput.trim());
      }
    }
    // Delay closing suggestions to allow click selection
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && locationInput.trim()) {
      // Check if it matches a popular city (case insensitive)
      const match = POPULAR_CITIES.find(
        (city) => city.toLowerCase() === locationInput.toLowerCase().trim(),
      );
      if (match) {
        isInternalUpdate.current = true;
        setLocationInput(match);
        onCityChange(match);
      } else {
        isInternalUpdate.current = true;
        onCityChange(locationInput.trim());
      }
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleClearLocation = () => {
    isInternalUpdate.current = true;
    setLocationInput("");
    onCityChange("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const hasActiveFilters =
    activeCategoryId ||
    activeCondition ||
    activeCity ||
    minPrice ||
    maxPrice ||
    showSold;

  const activeFilterCount = [
    activeCategoryId,
    activeCondition,
    activeCity,
    minPrice || maxPrice ? true : false,
    showSold,
  ].filter(Boolean).length;

  // If collapsed, show only icons
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center py-4 space-y-4">
        <div className="relative">
          <button
            onClick={() => toggleSection("categories")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Categories"
          >
            <FolderTree className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <button
          onClick={() => toggleSection("price")}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Price"
        >
          <DollarSign className="h-5 w-5 text-gray-500" />
        </button>
        <button
          onClick={() => toggleSection("condition")}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Condition"
        >
          <Tag className="h-5 w-5 text-gray-500" />
        </button>
        <button
          onClick={() => toggleSection("location")}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Location"
        >
          <MapPin className="h-5 w-5 text-gray-500" />
        </button>
        <button
          onClick={() => toggleSection("status")}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Status"
        >
          <CircleDot className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white h-full overflow-hidden">
      <div className="p-4 space-y-4 h-full overflow-hidden">
        {/* Categories */}
        <div className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
          <button
            onClick={() => toggleSection("categories")}
            className="flex items-center justify-between w-full group"
          >
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 group-hover:text-gray-700 transition-colors">
              <FolderTree className="h-4 w-4" />
              Categories
            </span>
            <span className="text-gray-400 text-base font-light transition-transform duration-200 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100">
              {expandedSections.categories ? "−" : "+"}
            </span>
          </button>
          {expandedSections.categories && (
            <div className="mt-2 space-y-0.5">
              <button
                onClick={() => onCategoryChange("")}
                className={`w-full text-left px-2.5 py-1.5 text-sm rounded-lg transition-all ${
                  activeCategoryId === ""
                    ? "text-orange-700 font-medium bg-orange-50"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`w-full text-left px-2.5 py-1.5 text-sm rounded-lg transition-all ${
                    activeCategoryId === cat.id
                      ? "text-orange-700 font-medium bg-orange-50"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
          <button
            onClick={() => toggleSection("price")}
            className="flex items-center justify-between w-full group"
          >
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 group-hover:text-gray-700 transition-colors">
              <DollarSign className="h-4 w-4" />
              Price Range
            </span>
            <span className="text-gray-400 text-base font-light transition-transform duration-200 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100">
              {expandedSections.price ? "−" : "+"}
            </span>
          </button>
          {expandedSections.price && (
            <div className="mt-2.5">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    Min
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => onMinPriceChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-gray-400"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    Max
                  </label>
                  <input
                    type="number"
                    placeholder="Any"
                    value={maxPrice}
                    onChange={(e) => onMaxPriceChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
              {(minPrice || maxPrice) && (
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{
                      width:
                        minPrice && maxPrice
                          ? "100%"
                          : minPrice
                            ? "50%"
                            : maxPrice
                              ? "50%"
                              : "0%",
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Condition */}
        <div className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
          <button
            onClick={() => toggleSection("condition")}
            className="flex items-center justify-between w-full group"
          >
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 group-hover:text-gray-700 transition-colors">
              <Tag className="h-4 w-4" />
              Condition
            </span>
            <span className="text-gray-400 text-base font-light transition-transform duration-200 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100">
              {expandedSections.condition ? "−" : "+"}
            </span>
          </button>
          {expandedSections.condition && (
            <div className="mt-2 space-y-0.5">
              <button
                onClick={() => onConditionChange("")}
                className={`w-full text-left px-2.5 py-1.5 text-sm rounded-lg transition-all ${
                  activeCondition === ""
                    ? "text-orange-700 font-medium bg-orange-50"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                Any
              </button>
              {CONDITIONS.map((cond) => (
                <button
                  key={cond.value}
                  onClick={() => onConditionChange(cond.value)}
                  className={`w-full text-left px-2.5 py-1.5 text-sm rounded-lg transition-all ${
                    activeCondition === cond.value
                      ? "text-orange-700 font-medium bg-orange-50"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {cond.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
          <button
            onClick={() => toggleSection("location")}
            className="flex items-center justify-between w-full group"
          >
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 group-hover:text-gray-700 transition-colors">
              <MapPin className="h-4 w-4" />
              Location
            </span>
            <span className="text-gray-400 text-base font-light transition-transform duration-200 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100">
              {expandedSections.location ? "−" : "+"}
            </span>
          </button>
          {expandedSections.location && (
            <div className="mt-2.5">
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Enter a city or location..."
                    value={locationInput}
                    onChange={handleLocationChange}
                    onFocus={() => {
                      if (locationInput.trim().length > 0) {
                        const filtered = POPULAR_CITIES.filter((city) =>
                          city
                            .toLowerCase()
                            .includes(locationInput.toLowerCase()),
                        );
                        setSuggestions(filtered.slice(0, 5));
                        setShowSuggestions(filtered.length > 0);
                      }
                    }}
                    onBlur={handleLocationBlur}
                    onKeyDown={handleKeyDown}
                    className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-gray-400"
                  />
                  {locationInput && (
                    <button
                      onClick={handleClearLocation}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  >
                    {suggestions.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleLocationSelect(city)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-orange-50 transition-colors flex items-center gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {city}
                      </button>
                    ))}
                    {locationInput.trim().length > 0 &&
                      !suggestions.some(
                        (s) =>
                          s.toLowerCase() ===
                          locationInput.toLowerCase().trim(),
                      ) && (
                        <button
                          onClick={() => {
                            const value = locationInput.trim();
                            isInternalUpdate.current = true;
                            onCityChange(value);
                            setLocationInput(value);
                            setShowSuggestions(false);
                            inputRef.current?.blur();
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 transition-colors border-t border-gray-100 font-medium"
                        >
                          + Search for &ldquo;{locationInput.trim()}&rdquo;
                        </button>
                      )}
                  </div>
                )}
              </div>
              {activeCity && (
                <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full inline-block"></span>
                  Showing results for:{" "}
                  <span className="font-medium text-gray-700">
                    {activeCity}
                  </span>
                </p>
              )}
              <p className="mt-1.5 text-xs text-gray-400">
                Enter a city name or select from suggestions
              </p>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="pb-0">
          <button
            onClick={() => toggleSection("status")}
            className="flex items-center justify-between w-full group"
          >
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 group-hover:text-gray-700 transition-colors">
              <CircleDot className="h-4 w-4" />
              Status
            </span>
            <span className="text-gray-400 text-base font-light transition-transform duration-200 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100">
              {expandedSections.status ? "−" : "+"}
            </span>
          </button>
          {expandedSections.status && (
            <div className="mt-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showSold}
                  onChange={(e) => onToggleSold(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-offset-0 transition-all"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Show sold items
                </span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
