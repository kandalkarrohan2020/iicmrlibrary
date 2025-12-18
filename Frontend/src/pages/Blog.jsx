import React, { useState, useEffect } from "react";
import { useAuth } from "../store/auth";
import { Link } from "react-router-dom";
import BlogImage from "../assets/newblog/blog-test-image.png";
import { IoMdTrendingUp } from "react-icons/io";

const HERO_BG = "linear-gradient(180deg,#F2FDF6 0%,#FFFFFF 50%,#F2FDF6 100%)";
// subtle body background
const BODY_BG = "linear-gradient(180deg,#F7FBF9 0%,#F2FDF6 100%)";

const FILTERS = [
  "All",
  "Mobile Apps",
  "Properties",
  "Guides",
  "Sales",
  "How to",
  "Rules & Laws",
  "Marketing",
];

export default function NewBlogs() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);

  const { URI } = useAuth();
  const [blogs, setBlogs] = useState([]);

  // Fetch Property Info
  const fetchData = async () => {
    try {
      const response = await fetch(`${URI}/frontend/blog`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch blogs.");
      const data = await response.json();
      console.log(data);
      setBlogs(data);
    } catch (err) {
      console.error("Error fetching Blogs:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = blogs?.filter((b) => {
    if (activeFilter !== "All") {
      if (!b.tittle.toLowerCase().includes(activeFilter.toLowerCase()))
        return false;
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        b.tittle.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const visible = filtered?.slice(0, visibleCount);

  return (
    <div className="min-h-screen" style={{ background: BODY_BG }}>
      {/* Hero */}
      <section
        className="w-full py-12 md:py-16"
        style={{ background: HERO_BG }}
        aria-label="Blog hero"
      >
        <div className="max-w-6xl mx-auto px-4">
          {/* center everything horizontally */}
          <div className="flex flex-col items-center text-center gap-6">
            <p className="text-sm text-green-600 font-medium">
              # Latest From Our Blog
            </p>
            <h1 className="text-5xl md:text-5xl font-semibold leading-tight text-[#101828]">
              Insights & Stories
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Discover the latest trends, insights, and stories from the world
              of technology and innovation.
            </p>

            {/* Search - centered and full width on small screens */}
            <div className="w-full flex justify-center">
              <div className="w-full flex flex-col gap-4 max-w-2xl sm:px-4">
                <label className="relative block">
                  <span className="sr-only">Search articles</span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search articles..."
                    className="w-full px-5 py-3 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 placeholder-gray-400 bg-[#F3F3F5]"
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
                      "Mobile Apps",
                      "Properties",
                      "Guides",
                      "Sales",
                      "How to",
                    ].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setQuery(tag);
                        }}
                        className="text-sm px-3 py-1 rounded-full border border-gray-200 bg-white text-gray-700 hover:shadow cursor-pointer"
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

          {/* Cards grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {visible?.map((b) => (
              <article
                key={b.id}
                className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-101 transition-all duration-300 cursor-default"
              >
                <div className="h-50 w-full overflow-hidden bg-gray-50">
                  <img
                    src={
                      URI + b?.image ||
                      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
                    }
                    alt={b?.tittle}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center text-xs text-gray-500 gap-3">
                    <span>{b.updated_at}</span>
                    <span>•</span>
                    <span>{b.readTime || "5 min"}</span>
                  </div>

                  <h3 className="mt-3 text-lg font-semibold text-gray-900 leading-snug">
                    {b.tittle}
                  </h3>

                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                    {b.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <Link
                      to={`/blog/${b.seoSlug}`}
                      className="text-[#0bb501] text-base font-medium flex items-center gap-1"
                    >
                      Read More
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 12h14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 5l7 7-7 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </div>
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
              Load More Articles
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
