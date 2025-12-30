import Head from "next/head";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  ChevronDown,
  RefreshCw,
  Loader2,
  AlertCircle,
  Search,
  X,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import Logo from "../components/Logo";

interface InventoryItem {
  row_number: number;
  "MATERIAL GROUP": string;
  "SKU Code": string;
  "Material Description": string;
  UOM: string;
  "Opening Stock": number;
  "Today's In": number;
  "Today's Out": number;
  "Closing Stock": number;
}

interface InventoryData {
  lastUpdated: string | null;
  items: InventoryItem[];
}

export default function RMInventory() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyIn, setShowOnlyIn] = useState(false);
  const [showOnlyOut, setShowOnlyOut] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch inventory data on mount
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch("/api/rm-inventory");
        if (!res.ok) {
          throw new Error("Failed to fetch inventory");
        }
        const data: InventoryData = await res.json();
        setInventory(data.items || []);
        setLastUpdated(data.lastUpdated);
      } catch (err: any) {
        console.error("Error fetching inventory:", err);
        setError(err.message || "Failed to load inventory");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Derive unique categories from data
  const categories = useMemo(() => {
    const uniqueGroups = new Set(
      inventory.map((item) => item["MATERIAL GROUP"])
    );
    return ["All Categories", ...Array.from(uniqueGroups).sort()];
  }, [inventory]);

  // Filter items by selected category and search term
  const filteredItems = useMemo(() => {
    return inventory.filter((item) => {
      const matchesCategory =
        selectedCategory === "All Categories" ||
        item["MATERIAL GROUP"] === selectedCategory;
      const matchesSearch = item["Material Description"]
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const matchesActivityIn = !showOnlyIn || item["Today's In"] > 0;
      const matchesActivityOut = !showOnlyOut || item["Today's Out"] > 0;

      return matchesCategory && matchesSearch && matchesActivityIn && matchesActivityOut;
    });
  }, [inventory, selectedCategory, searchTerm, showOnlyIn, showOnlyOut]);

  // Get today's date formatted
  const todayDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[var(--apple-bg)] font-sans">
      <Head>
        <title>Raw Material Inventory | Factory Entry System</title>
        <meta
          name="description"
          content="View raw material inventory and stock levels"
        />
      </Head>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-8 sm:mb-10">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[var(--apple-text-secondary)] hover:text-[var(--apple-text)] 
                bg-white hover:bg-[var(--apple-gray-100)] px-4 py-2 rounded-full border border-[var(--apple-border)]/50 
                shadow-[var(--shadow-xs)] transition-all duration-200 text-[15px] font-medium"
            >
              <ArrowLeft size={18} strokeWidth={2} />
              <span>Back</span>
            </Link>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-3.5 rounded-2xl text-white shadow-lg shadow-violet-500/25">
              <Package size={28} strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-[var(--apple-text)] tracking-tight">
                Raw Material Inventory
              </h1>
            </div>
          </div>

          {/* Date and Last Refreshed */}
          <div className="mt-4 space-y-1">
            <p className="text-lg sm:text-xl text-[var(--apple-text)] font-medium">
              {todayDate}
            </p>
            <p className="text-sm text-[var(--apple-text-secondary)] italic flex items-center gap-1.5">
              <RefreshCw size={12} strokeWidth={2} />
              {lastUpdated
                ? `Last refreshed: ${lastUpdated}`
                : "No data received yet"}
            </p>
          </div>
        </div>

        {/* Filter & Search Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end gap-5">
            {/* Search Input */}
            <div className="flex-1 space-y-2">
              <label className="text-[13px] font-semibold text-[var(--apple-text-secondary)] uppercase tracking-wider ml-1">
                Search Materials
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search
                    size={18}
                    className="text-[var(--apple-text-secondary)] group-focus-within:text-[var(--apple-blue)] transition-colors duration-200"
                    strokeWidth={2}
                  />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by description..."
                  className="w-full pl-11 pr-11 py-3.5 bg-white border-2 border-[var(--apple-gray-200)] rounded-2xl 
                    text-[var(--apple-text)] text-[15px] font-medium shadow-[var(--shadow-xs)]
                    focus:border-[var(--apple-blue)] focus:ring-4 focus:ring-[var(--apple-blue)]/10 
                    hover:border-[var(--apple-gray-300)] transition-all duration-200 outline-none"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--apple-text-secondary)] hover:text-[var(--apple-text)] transition-colors duration-200"
                  >
                    <div className="bg-[var(--apple-gray-100)] p-1 rounded-full">
                      <X size={14} strokeWidth={2.5} />
                    </div>
                  </button>
                )}
              </div>
            </div>

            <div className="w-full lg:w-72 space-y-2">
              <label className="text-[13px] font-semibold text-[var(--apple-text-secondary)] uppercase tracking-wider ml-1">
                Material Category
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full py-3.5 px-4 pr-10 bg-white border-2 border-[var(--apple-gray-200)] rounded-2xl 
                    text-[var(--apple-text)] text-[15px] font-medium shadow-[var(--shadow-xs)]
                    focus:border-[var(--apple-blue)] focus:ring-4 focus:ring-[var(--apple-blue)]/10 
                    hover:border-[var(--apple-gray-300)] transition-all duration-200 outline-none appearance-none cursor-pointer"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--apple-text-secondary)]">
                  <ChevronDown size={18} strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>

          {/* Activity Filters */}
          <div className="mt-6 space-y-3">
            <span className="text-[13px] font-semibold text-[var(--apple-text-secondary)] uppercase tracking-wider ml-1 block">
              Activity Today
            </span>
            
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowOnlyIn(!showOnlyIn)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 transition-all duration-300 font-medium text-[15px]
                  ${showOnlyIn 
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-4 ring-emerald-500/10' 
                    : 'bg-white border-[var(--apple-gray-200)] text-[var(--apple-text-secondary)] hover:border-[var(--apple-gray-300)] hover:bg-[var(--apple-gray-50)]'
                  }`}
              >
                <ArrowDownCircle size={18} strokeWidth={showOnlyIn ? 2.5 : 2} />
                <span>In Today</span>
              </button>

              <button
                onClick={() => setShowOnlyOut(!showOnlyOut)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 transition-all duration-300 font-medium text-[15px]
                  ${showOnlyOut 
                    ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-4 ring-amber-500/10' 
                    : 'bg-white border-[var(--apple-gray-200)] text-[var(--apple-text-secondary)] hover:border-[var(--apple-gray-300)] hover:bg-[var(--apple-gray-50)]'
                  }`}
              >
                <ArrowUpCircle size={18} strokeWidth={showOnlyOut ? 2.5 : 2} />
                <span>Out Today</span>
              </button>

              {(showOnlyIn || showOnlyOut || searchTerm || selectedCategory !== "All Categories") && (
                <button
                  onClick={() => {
                    setShowOnlyIn(false);
                    setShowOnlyOut(false);
                    setSearchTerm("");
                    setSelectedCategory("All Categories");
                  }}
                  className="ml-auto text-sm text-[var(--apple-blue)] font-medium hover:underline px-2"
                >
                  Reset all
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[var(--shadow-lg)] border border-black/[0.04] p-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-[var(--apple-blue)] animate-spin" />
            <p className="text-[var(--apple-text-secondary)] font-medium">
              Loading inventory...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[var(--shadow-lg)] border border-red-200 p-8 flex flex-col items-center justify-center gap-3">
            <div className="bg-red-100 p-3 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Empty / No Search Results State */}
        {!isLoading &&
          !error &&
          (inventory.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[var(--shadow-lg)] border border-black/[0.04] p-12 flex flex-col items-center justify-center gap-4">
              <div className="bg-[var(--apple-gray-100)] p-4 rounded-2xl">
                <Package className="w-8 h-8 text-[var(--apple-text-secondary)]" />
              </div>
              <div className="text-center">
                <p className="text-[var(--apple-text)] font-semibold mb-1">
                  No inventory data
                </p>
                <p className="text-[var(--apple-text-secondary)] text-sm">
                  Waiting for data to be posted to this endpoint.
                </p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[var(--shadow-lg)] border border-black/[0.04] p-12 flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in duration-300">
              <div className="bg-[var(--apple-bg)] p-5 rounded-3xl border border-[var(--apple-border)]">
                <Search className="w-8 h-8 text-[var(--apple-text-secondary)]" />
              </div>
              <div className="text-center">
                <p className="text-[var(--apple-text)] font-semibold text-lg mb-1">
                  No matching materials
                </p>
                <p className="text-[var(--apple-text-secondary)] text-[15px]">
                  We couldn't find anything matching your current filters.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All Categories");
                    setShowOnlyIn(false);
                    setShowOnlyOut(false);
                  }}
                  className="mt-6 text-[var(--apple-blue)] font-medium hover:underline flex items-center gap-2 mx-auto"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          ) : null)}

        {/* Inventory Table */}
        {!isLoading && !error && filteredItems.length > 0 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[var(--shadow-lg)] border border-black/[0.04] overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[var(--apple-gray-50)] border-b border-[var(--apple-gray-200)]">
                  <tr>
                    <th className="py-4 px-6 text-xs font-semibold text-[var(--apple-text-secondary)] uppercase tracking-wider">
                      Item
                    </th>
                    <th className="py-4 px-6 text-xs font-semibold text-[var(--apple-text-secondary)] uppercase tracking-wider text-center">
                      Unit
                    </th>
                    <th className="py-4 px-6 text-xs font-semibold text-[var(--apple-text-secondary)] uppercase tracking-wider text-right">
                      In
                    </th>
                    <th className="py-4 px-6 text-xs font-semibold text-[var(--apple-text-secondary)] uppercase tracking-wider text-right">
                      Out
                    </th>
                    <th className="py-4 px-6 text-xs font-semibold text-[var(--apple-text-secondary)] uppercase tracking-wider text-right">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--apple-gray-100)]">
                  {filteredItems.map((item, index) => (
                    <tr
                      key={item["SKU Code"] || index}
                      className="hover:bg-[var(--apple-gray-50)] transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="text-[15px] font-medium text-[var(--apple-text)]">
                          {item["Material Description"]}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg 
                          bg-[var(--apple-gray-100)] text-xs font-semibold text-[var(--apple-text-secondary)] uppercase"
                        >
                          {item.UOM}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-[15px] font-medium text-emerald-600 tabular-nums">
                          +{item["Today's In"].toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-[15px] font-medium text-amber-600 tabular-nums">
                          −{item["Today's Out"].toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span
                          className={`text-[15px] font-semibold tabular-nums ${
                            item["Closing Stock"] < 0
                              ? "text-red-600"
                              : "text-[var(--apple-text)]"
                          }`}
                        >
                          {item["Closing Stock"].toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-[var(--apple-gray-100)]">
              {filteredItems.map((item, index) => (
                <div
                  key={item["SKU Code"] || index}
                  className="p-4 hover:bg-[var(--apple-gray-50)] transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-[15px] font-semibold text-[var(--apple-text)] flex-1 pr-3">
                      {item["Material Description"]}
                    </h3>
                    <span
                      className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg 
                      bg-[var(--apple-gray-100)] text-xs font-semibold text-[var(--apple-text-secondary)] uppercase shrink-0"
                    >
                      {item.UOM}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-1">
                        In
                      </p>
                      <p className="text-base font-semibold text-emerald-600 tabular-nums">
                        +{item["Today's In"].toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide mb-1">
                        Out
                      </p>
                      <p className="text-base font-semibold text-amber-600 tabular-nums">
                        −{item["Today's Out"].toLocaleString()}
                      </p>
                    </div>
                    <div
                      className={`rounded-xl p-3 text-center ${
                        item["Closing Stock"] < 0
                          ? "bg-red-50"
                          : "bg-[var(--apple-gray-100)]"
                      }`}
                    >
                      <p
                        className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${
                          item["Closing Stock"] < 0
                            ? "text-red-600"
                            : "text-[var(--apple-text-secondary)]"
                        }`}
                      >
                        Stock
                      </p>
                      <p
                        className={`text-base font-bold tabular-nums ${
                          item["Closing Stock"] < 0
                            ? "text-red-600"
                            : "text-[var(--apple-text)]"
                        }`}
                      >
                        {item["Closing Stock"].toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items count */}
        {!isLoading && !error && filteredItems.length > 0 && (
          <p className="mt-4 text-sm text-[var(--apple-text-secondary)] text-center">
            Showing {filteredItems.length} of {inventory.length} items
          </p>
        )}

        {/* Footer Spacer for mobile */}
        <div className="h-10 sm:h-0"></div>
      </div>
    </div>
  );
}
