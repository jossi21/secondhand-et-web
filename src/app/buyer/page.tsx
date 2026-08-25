import { Heart, Star, Flag, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const savedListings = [
  {
    id: 1,
    title: 'Toyota Corolla 2018 — 1.6L, Automatic',
    price: 'ETB 1,250,000',
    condition: 'Lightly Used',
    location: 'Addis Ababa',
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    title: 'Dell Latitude 7420 Laptop — i7, 16GB RAM',
    price: 'ETB 42,000',
    condition: 'Lightly Used',
    location: 'Addis Ababa',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
  },
  {
    id: 3,
    title: 'Bajaj Boxer 150cc Motorcycle — 2022',
    price: 'ETB 55,000',
    condition: 'Lightly Used',
    location: 'Addis Ababa',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&h=300&fit=crop',
  },
  {
    id: 4,
    title: 'Samsung 450L Refrigerator — Double Door',
    price: 'ETB 14,500',
    condition: 'Lightly Used',
    location: 'Hawassa',
    image: 'https://images.unsplash.com/photo-1571175443880-49e1d58b794a?w=400&h=300&fit=crop',
  },
];

const ratings = [
  {
    id: 1,
    name: 'Abel Tesfaye',
    initial: 'A',
    rating: 5,
    maxRating: 5,
    comment: 'Smooth transaction, item exactly as described. Highly recommend.',
    date: 'Aug 18, 2026',
  },
  {
    id: 2,
    name: 'Dawit Haile',
    initial: 'D',
    rating: 4,
    maxRating: 5,
    comment: 'Good seller, took a while to confirm meetup.',
    date: 'Jul 30, 2026',
  },
];

export default function BuyerDashboard() {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* View Toggle */}
      <div className="bg-[#faf8f5] border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="inline-flex bg-white rounded-lg border border-gray-200 p-0.5">
            <button className="px-4 py-1.5 text-sm text-gray-600 rounded-md hover:text-gray-900">
              Seller View
            </button>
            <button className="px-4 py-1.5 text-sm font-medium text-gray-900 bg-gray-100 rounded-md shadow-sm">
              Buyer View
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-1">Buyer Dashboard</p>
          <h1 className="text-2xl font-bold text-gray-900">My Activity</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <Heart className="w-5 h-5 text-gray-900 mb-3 fill-gray-900" />
            <p className="text-2xl font-bold text-gray-900 mb-1">4</p>
            <p className="text-sm text-gray-500">Saved Listings</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <Star className="w-5 h-5 text-yellow-500 mb-3 fill-yellow-500" />
            <p className="text-2xl font-bold text-gray-900 mb-1">2</p>
            <p className="text-sm text-gray-500">Ratings Given</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <Flag className="w-5 h-5 text-red-500 mb-3 fill-red-500" />
            <p className="text-2xl font-bold text-gray-900 mb-1">0</p>
            <p className="text-sm text-gray-500">Reports Filed</p>
          </div>
        </div>

        {/* Saved Listings */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Saved Listings</h2>
            <Link href="/browse" className="text-sm text-orange-600 hover:text-orange-700">
              Browse more →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {savedListings.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="relative h-36 bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-orange-600">{item.price}</span>
                    <span className="text-xs text-gray-500">{item.condition}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{item.location}</p>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md py-1.5 hover:bg-gray-50 transition">
                      View
                    </button>
                    <button className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-gray-50 transition">
                      <X className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ratings Given */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Ratings I Have Given</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {ratings.map((rating) => (
              <div key={rating.id} className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-bold shrink-0">
                  {rating.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{rating.name}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: rating.maxRating }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rating.rating
                              ? 'text-orange-500 fill-orange-500'
                              : 'text-gray-300 fill-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {rating.rating}/{rating.maxRating}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{rating.comment}</p>
                  <p className="text-xs text-gray-400">{rating.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}