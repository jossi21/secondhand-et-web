"use client";

import React, { useState, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  date: string;
  seller: string;
  rating: number;
  verified: boolean;
  condition: Condition;
  views: number;
  image: string;
  sold: boolean;
}

type Condition = "Any Condition" | "Brand New" | "Lightly Used" | "Fair Condition";

interface Category {
  name: string;
  count: number;
  icon: string;
}

// ─── Data ──────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  { name: "All Categories", count: 764, icon: "" },
  { name: "Electronics", count: 234, icon: "📱" },
  { name: "Furniture", count: 118, icon: "🛋️" },
  { name: "Vehicles", count: 89, icon: "🚗" },
  { name: "Appliances", count: 76, icon: "🏠" },
  { name: "Clothing", count: 192, icon: "👕" },
  { name: "Books & Education", count: 55, icon: "📚" },
];

const PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Sony WH-1000XM5 Headphones — Brand New",
    description: "Purchased as a gift, never used. Still in original packaging with warranty.",
    price: 9800,
    location: "Addis Ababa, Bole",
    date: "4 days ago",
    seller: "Abel Tesfaye",
    rating: 4.8,
    verified: true,
    condition: "Brand New",
    views: 177,
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=450&fit=crop",
    sold: false,
  },
  {
    id: 2,
    title: "iPhone 12 Pro — 128GB, Midnight Blue",
    description: "Bought in Dubai last year, barely used. No scratches, battery health 96%.",
    price: 38000,
    location: "Addis Ababa, Bole",
    date: "5 days ago",
    seller: "Abel Tesfaye",
    rating: 4.8,
    verified: true,
    condition: "Lightly Used",
    views: 212,
    image: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600&h=450&fit=crop",
    sold: false,
  },
  {
    id: 3,
    title: "Dell Latitude 7420 Laptop — i7, 16GB RAM",
    description: "Corporate laptop, retired from office use. Excellent condition, 512GB SSD.",
    price: 42000,
    location: "Addis Ababa, Kazanchis",
    date: "6 days ago",
    seller: "Selamawit Girma",
    rating: 4.6,
    verified: true,
    condition: "Lightly Used",
    views: 348,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=450&fit=crop",
    sold: false,
  },
  {
    id: 4,
    title: "L-Shaped Sofa — Dark Brown Leather",
    description: "3+2 seater L-shaped sofa in genuine Italian leather. Perfect for family living room.",
    price: 18500,
    location: "Addis Ababa, Sarbet",
    date: "5 days ago",
    seller: "Yohannes Bekele",
    rating: 4.3,
    verified: false,
    condition: "Fair Condition",
    views: 91,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=450&fit=crop",
    sold: false,
  },
  {
    id: 5,
    title: "Samsung 450L Refrigerator — Double Door",
    description: "Purchased 2 years ago, working perfectly. Frost-free, energy efficient inverter compressor.",
    price: 14500,
    location: "Hawassa, Piazza",
    date: "6 days ago",
    seller: "Tigist Alemu",
    rating: 4.9,
    verified: true,
    condition: "Lightly Used",
    views: 55,
    image: "https://images.unsplash.com/photo-1571175443880-49e1d58b794a?w=600&h=450&fit=crop",
    sold: false,
  },
  {
    id: 6,
    title: "Toyota Corolla 2018 — 1.6L, Manual",
    description: "Full insurance, annual inspection done. Single owner, well maintained service history.",
    price: 1250000,
    location: "Addis Ababa, Megenagna",
    date: "Aug 10, 2026",
    seller: "Dawit Haile",
    rating: 5.0,
    verified: true,
    condition: "Lightly Used",
    views: 682,
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=450&fit=crop",
    sold: false,
  },
  {
    id: 7,
    title: "Bajaj Boxer 150cc Motorcycle — 2022",
    description: "2022 model, only 8,000 km driven. All original parts, recently serviced.",
    price: 95000,
    location: "Adama, Kebele 03",
    date: "1 week ago",
    seller: "Kidus Girma",
    rating: 4.7,
    verified: true,
    condition: "Lightly Used",
    views: 289,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=450&fit=crop",
    sold: false,
  },
];

const CONDITIONS: Condition[] = [
  "Any Condition",
  "Brand New",
  "Lightly Used",
  "Fair Condition",
];

const CITIES = ["Any City", "Addis Ababa", "Hawassa", "Adama", "Dire Dawa"];

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return price.toLocaleString("en-US");
}

// ─── Components ────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-gray-900">
              SecondHand
            </span>
            <span className="bg-orange-700 text-white text-xs font-bold px-1.5 py-0.5 rounded">
              ET
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-500 hover:text-gray-900 font-medium transition-colors">
              Home
            </Link>
            <Link href="/browse" className="text-orange-700 font-semibold">
              Browse
            </Link>
            <Link href="/sell" className="text-gray-500 hover:text-gray-900 font-medium transition-colors">
              Sell
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/saved" className="hidden sm:block text-gray-500 hover:text-gray-900 font-medium transition-colors">
            My Saved
          </Link>
          <Link href="/signin" className="hidden sm:block px-5 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition-colors">
            Sign In
          </Link>
          <Link href="/post" className="px-5 py-2 bg-orange-700 hover:bg-orange-800 text-white font-medium rounded-lg transition-colors shadow-sm">
            Post Item
          </Link>
        </div>
      </div>
    </header>
  );
}

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (c: string) => void;
  activeCondition: Condition;
  onConditionChange: (c: Condition) => void;
  activeCity: string;
  onCityChange: (c: string) => void;
  showSold: boolean;
  onToggleSold: (v: boolean) => void;
}

function Sidebar({
  activeCategory,
  onCategoryChange,
  activeCondition,
  onConditionChange,
  activeCity,
  onCityChange,
  showSold,
  onToggleSold,
}: SidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>

      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Category
        </h3>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => onCategoryChange(cat.name)}
                className={`
                  w-full flex items-center justify-between text-left px-4 py-2.5 font-medium transition-all rounded-lg
                  ${isActive ? "bg-orange-700 text-white" : "text-gray-900 hover:bg-white"}
                `}
              >
                <span className="flex items-center gap-2">
                  {cat.icon && <span className="text-sm">{cat.icon}</span>}
                  {cat.name}
                </span>
                {!isActive && (
                  <span className="text-gray-400 text-sm">{cat.count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* City Filter */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          City
        </h3>
        <div className="relative">
          <select
            value={activeCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-700/20 focus:border-orange-700"
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Condition Filter */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Condition
        </h3>
        <div className="space-y-1">
          {CONDITIONS.map((condition) => {
            const isActive = activeCondition === condition;
            return (
              <button
                key={condition}
                onClick={() => onConditionChange(condition)}
                className={`
                  w-full text-left px-4 py-2.5 font-medium transition-all rounded-lg
                  ${isActive ? "bg-orange-700 text-white" : "text-gray-900 hover:bg-white"}
                `}
              >
                {condition}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Price Range (ETB)
        </h3>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Min"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-700/20 focus:border-orange-700 transition-all"
          />
          <input
            type="number"
            placeholder="Max"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-700/20 focus:border-orange-700 transition-all"
          />
        </div>
      </div>

      {/* Show Sold Items */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="soldItems"
          checked={showSold}
          onChange={(e) => onToggleSold(e.target.checked)}
          className="w-4 h-4 text-orange-700 border-gray-300 rounded focus:ring-orange-700 cursor-pointer"
        />
        <label
          htmlFor="soldItems"
          className="text-gray-900 font-medium cursor-pointer select-none"
        >
          Show sold items
        </label>
      </div>
    </aside>
  );
}

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="bg-white rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute top-3 left-3">
          <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold rounded-full shadow-sm">
            {product.condition}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-900/70 backdrop-blur-sm text-white text-xs font-medium rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {product.views} views
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-1.5 group-hover:text-orange-700 transition-colors">
          {product.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="text-xs text-orange-700 font-semibold uppercase tracking-wide">
              ETB
            </span>
            <span className="text-orange-700 text-xl font-bold tabular-nums ml-1">
              {formatPrice(product.price)}
            </span>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs">{product.location}</p>
            <p className="text-gray-400 text-xs mt-0.5">{product.date}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm font-medium">
                {product.seller}
              </span>
              {product.verified && (
                <span className="text-emerald-500" title="Verified Seller">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-gray-500 text-sm font-semibold">{product.rating}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function BrowsePage() {
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [activeCondition, setActiveCondition] = useState<Condition>("Any Condition");
  const [activeCity, setActiveCity] = useState("Any City");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Newest First");
  const [showSold, setShowSold] = useState(false);

  const filteredProducts = useMemo(() => {
    let pool = [...PRODUCTS];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pool = pool.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (activeCategory !== "All Categories") {
      const categoryKeywords: Record<string, string[]> = {
        Electronics: ["headphones", "iphone", "laptop", "samsung"],
        Furniture: ["sofa", "table"],
        Vehicles: ["toyota", "motorcycle", "bajaj"],
        Appliances: ["refrigerator"],
        Clothing: [],
        "Books & Education": [],
      };
      const keywords = categoryKeywords[activeCategory] || [];
      if (keywords.length > 0) {
        pool = pool.filter((p) =>
          keywords.some((kw) => p.title.toLowerCase().includes(kw))
        );
      }
    }

    if (activeCondition !== "Any Condition") {
      pool = pool.filter((p) => p.condition === activeCondition);
    }

    if (activeCity !== "Any City") {
      pool = pool.filter((p) => p.location.includes(activeCity));
    }

    if (sortBy === "Newest First") {
      // Already in order
    } else if (sortBy === "Price: Low to High") {
      pool.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      pool.sort((a, b) => b.price - a.price);
    }

    return pool;
  }, [activeCategory, activeCondition, activeCity, searchQuery, sortBy]);

  return (
    <>
      <Head>
        <title>SecondHand ET — Browse</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#F5F5F0] text-gray-900 font-sans">
        <Navbar />

        {/* Search Bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-[1400px] mx-auto px-6 py-4">
            <div className="flex gap-3 max-w-3xl">
              <input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-700/20 focus:border-orange-700 transition-all"
              />
              <button className="px-8 py-3 bg-orange-700 hover:bg-orange-800 text-white font-semibold rounded-xl transition-colors shadow-sm">
                Search
              </button>
            </div>
          </div>
        </div>

        <main className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="flex gap-8">
            <Sidebar
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              activeCondition={activeCondition}
              onConditionChange={setActiveCondition}
              activeCity={activeCity}
              onCityChange={setActiveCity}
              showSold={showSold}
              onToggleSold={setShowSold}
            />

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden w-full mb-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
            </div>

            {/* Results Area */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {filteredProducts.length} listings found
                </h2>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-700/20 focus:border-orange-700"
                  >
                    <option>Newest First</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-gray-400 text-lg">No items found.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}