import React, { useState, useEffect } from "react";
import { useAuth } from "../store/auth";
import { Link } from "react-router-dom";
import itemImage from "../assets/items/image.webp";
import { IoMdTrendingUp } from "react-icons/io";

const HERO_BG =
  "linear-gradient(180deg, #E6F4EA 0%, #FFFFFF 50%, #DFF7E2 100%)";
const BODY_BG = "linear-gradient(180deg, #F9FCF9 0%, #E6F4EA 100%)";

const FILTERS = [
  "All",
  "Technology",
  "Computer Science",
  "Business",
  "Programming",
  "Networking",
  "Marketing",
];

export default function Items() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);

  const { URI } = useAuth();
  const [items, setItems] = useState([]);

  // Fetch
  const fetchData = async () => {
    try {
      const response = await fetch(`${URI}/frontend/items`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch items.");
      const data = await response.json();
      console.log(data);
      setItems(data);
    } catch (err) {
      console.error("Error fetching Items:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const safeLower = (val) => (val ? val.toString().toLowerCase() : "");

  const filtered = items?.filter((b) => {
    // Active filter (category / title etc.)
    if (activeFilter !== "All") {
      const filter = safeLower(activeFilter);

      if (
        !safeLower(b.title).includes(filter) &&
        !safeLower(b.description).includes(filter) &&
        !safeLower(b.category).includes(filter)
      ) {
        return false;
      }
    }

    // Search query
    if (query.trim()) {
      const q = safeLower(query);

      return (
        safeLower(b.title).includes(q) ||
        safeLower(b.author_name).includes(q) ||
        safeLower(b.isbn).includes(q) ||
        safeLower(b.category).includes(q) ||
        safeLower(b.description).includes(q)
      );
    }

    return true;
  });

  const visible = filtered?.slice(0, visibleCount);

  return (
    <div
      className="min-h-screen my-2 rounded-[20px] overflow-hidden"
      style={{ background: BODY_BG }}
    >
      {/* Hero */}
      <section
        className="w-full py-12 md:py-16"
        style={{ background: HERO_BG }}
        aria-label="hero"
      >
        <div className="max-w-6xl mx-auto px-4">
          {/* center everything horizontally */}
          <div className="flex flex-col items-center text-center gap-6">
            <p className="text-lg sm:text-xl text-teal-800 font-medium tracking-wide">
              📚 Welcome to the Digital Library
            </p>

            <h1 className="text-2xl md:text-5xl font-semibold leading-tight text-slate-900">
              Discover. Learn. Grow.
            </h1>

            <p className="text-slate-600 max-w-2xl text-sm sm:text-base">
              Access a curated collection of MCA and MBA books, research
              references, and practical guides to support your academic and
              professional journey.
            </p>

            {/* Search - centered and full width on small screens */}
            <div className="w-full flex justify-center">
              <div className="w-full flex flex-col gap-4 max-w-2xl sm:px-4">
                <label className="relative block">
                  <span className="sr-only">Search Items</span>
                  <input
                    value={query}
                    placeholder="Search books by title, author, ISBN..."
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full px-5 py-3 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 bg-[#ffffff]"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-black cursor-pointer"
                      aria-label="clear-search"
                    >
                      Clear
                    </button>
                  )}
                </label>

                {/* trending tags */}
                <div className="flex items-center justify-center flex-col sm:flex-row gap-3 mt-2">
                  <div className="flex items-center justify-center gap-1 text-sm text-[#4A5565] ">
                    <IoMdTrendingUp size={20} /> Trending
                  </div>
                  <div className="flex flex-wrap sm:justify-center gap-3">
                    {[
                      "MCA",
                      "Algorithms",
                      "Programming",
                      "DBMS",
                      "Management",
                    ].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setQuery(tag);
                        }}
                        className="text-xs sm:text-sm px-3 py-1 rounded-full border border-gray-200 bg-white text-gray-700 hover:shadow cursor-pointer"
                        type="button"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHARP separator (thin band with a sharper gradient) */}
      <div
        aria-hidden
        className="w-full"
        style={{
          height: 10,
          background:
            "linear-gradient(90deg, rgba(242,253,246,1) 0%, rgba(226,245,232,1) 50%, rgba(242,253,246,1) 100%)",
          boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
        }}
      />

      {/* Body - filters + cards */}
      <section className="max-w-6xl mx-auto pb-20 pt-8 px-4">
        <div className="bg-transparent rounded-lg">
          {/* Top filter buttons centered horizontally
              NOTE: default buttons are neutral (transparent/unstyled).
              Only the active one gets the green background.
          */}
          <div className="flex sm:justify-center">
            <div className="flex sm:flex-wrap gap-2 sm:gap-4 sm:justify-center overflow-scroll scrollbar-hide">
              {FILTERS?.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                    activeFilter === f
                      ? "bg-[#00A63E] text-white shadow"
                      : "bg-transparent text-gray-700 border border-transparent hover:bg-white/60"
                  }`}
                  type="button"
                  aria-pressed={activeFilter === f}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible?.map((b) => (
              <article
                key={b.itemId}
                className="group bg-white rounded-lg border border-gray-200
                           shadow-sm hover:shadow-lg hover:-translate-y-1
                           transition-all duration-300"
              >
                {/* Book Cover */}
                <div className="h-56 bg-gray-50 flex items-center justify-center border-b overflow-hidden">
                  <img
                    src={b.image ? URI + b.image : itemImage}
                    alt={b.title}
                    className="h-52 object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 leading-snug">
                    {b.title}
                  </h3>

                  {/* Status Badge */}
                  <span
                    className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                      b.available_copies > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {b.available_copies > 0 ? "Available" : "Unavailable"}
                  </span>

                  {/* Author */}
                  <p className="text-sm text-gray-600">
                    Author:{" "}
                    <span className="font-medium">
                      {b.author_name || "N/A"}
                    </span>
                  </p>

                  {/* Details */}
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>Edition:</strong> {b.edition}
                    </p>
                    <p>
                      <strong>Language:</strong> {b.language}
                    </p>
                    <p>
                      <strong>ISBN:</strong> {b.isbn}
                    </p>
                    <p>
                      <strong>Year:</strong> {b.publication_year}
                    </p>
                    <p>
                      <strong>Shelf:</strong> {b.shelf_location}
                    </p>
                  </div>

                  {/* Copies */}
                  <p
                    className={`text-sm font-semibold ${
                      b.available_copies > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {b.available_copies} copies available out of{" "}
                    {b.total_copies}
                  </p>

                  {/* Borrow Button */}
                  <button
                    disabled={b.available_copies === 0}
                    className={`w-full mt-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      b.available_copies > 0
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    {b.available_copies > 0 ? "Borrow Book" : "Out of Stock"}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Load more center */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setVisibleCount((c) => c + 6)}
              className="px-6 py-2 border border-[#00A63E] font-semibold rounded-full bg-white text-green-600 hover:bg-green-50 shadow cursor-pointer"
            >
              View More Books
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
