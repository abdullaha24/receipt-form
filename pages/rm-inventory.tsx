import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, Package, ChevronDown, RefreshCw } from 'lucide-react';
import { useState } from 'react';

// Dummy data for demonstration
const DUMMY_DATE = "23 December 2024";
const DUMMY_LAST_REFRESHED = "2 minutes ago";

const DUMMY_CATEGORIES = [
  "All Categories",
  "Chemicals",
  "Packaging",
  "Raw Powders",
  "Additives",
];

interface InventoryItem {
  item: string;
  unit: string;
  in: number;
  out: number;
  stock: number;
}

const DUMMY_INVENTORY: InventoryItem[] = [
  { item: "Cement Grade A", unit: "Kg", in: 5000, out: 1200, stock: 3800 },
  { item: "Calcium Chloride", unit: "Kg", in: 800, out: 250, stock: 550 },
  { item: "Silica Sand Fine", unit: "Kg", in: 3000, out: 1800, stock: 1200 },
  { item: "Polymer Resin X1", unit: "L", in: 500, out: 120, stock: 380 },
  { item: "Packing Bags 25kg", unit: "Pcs", in: 2000, out: 850, stock: 1150 },
  { item: "Plasticizer Type B", unit: "L", in: 200, out: 75, stock: 125 },
  { item: "Fiber Reinforcement", unit: "Kg", in: 400, out: 180, stock: 220 },
  { item: "Retarder Compound", unit: "Kg", in: 150, out: 45, stock: 105 },
];

export default function RMInventory() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  return (
    <div className="min-h-screen bg-[var(--apple-bg)] font-sans">
      <Head>
        <title>Raw Material Inventory | Factory Entry System</title>
        <meta name="description" content="View raw material inventory and stock levels" />
      </Head>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-8 sm:mb-10">
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
              {DUMMY_DATE}
            </p>
            <p className="text-sm text-[var(--apple-text-secondary)] italic flex items-center gap-1.5">
              <RefreshCw size={12} strokeWidth={2} />
              Last refreshed: {DUMMY_LAST_REFRESHED}
            </p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-medium text-[var(--apple-text-secondary)] uppercase tracking-wider">
              Filter by Category
            </label>
            <div className="relative w-full sm:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-3 px-4 pr-10 bg-white border-2 border-[var(--apple-gray-200)] rounded-xl 
                  text-[var(--apple-text)] text-[15px] font-medium shadow-[var(--shadow-xs)]
                  focus:border-[var(--apple-blue)] focus:ring-4 focus:ring-[var(--apple-blue)]/10 
                  hover:border-[var(--apple-gray-300)] transition-all duration-200 outline-none appearance-none cursor-pointer"
              >
                {DUMMY_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--apple-text-secondary)]">
                <ChevronDown size={18} strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
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
                {DUMMY_INVENTORY.map((item, index) => (
                  <tr key={index} className="hover:bg-[var(--apple-gray-50)] transition-colors">
                    <td className="py-4 px-6">
                      <span className="text-[15px] font-medium text-[var(--apple-text)]">
                        {item.item}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg 
                        bg-[var(--apple-gray-100)] text-xs font-semibold text-[var(--apple-text-secondary)] uppercase">
                        {item.unit}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-[15px] font-medium text-emerald-600 tabular-nums">
                        +{item.in.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-[15px] font-medium text-amber-600 tabular-nums">
                        −{item.out.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-[15px] font-semibold text-[var(--apple-text)] tabular-nums">
                        {item.stock.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden divide-y divide-[var(--apple-gray-100)]">
            {DUMMY_INVENTORY.map((item, index) => (
              <div key={index} className="p-4 hover:bg-[var(--apple-gray-50)] transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-[15px] font-semibold text-[var(--apple-text)] flex-1 pr-3">
                    {item.item}
                  </h3>
                  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg 
                    bg-[var(--apple-gray-100)] text-xs font-semibold text-[var(--apple-text-secondary)] uppercase shrink-0">
                    {item.unit}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-1">In</p>
                    <p className="text-base font-semibold text-emerald-600 tabular-nums">
                      +{item.in.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide mb-1">Out</p>
                    <p className="text-base font-semibold text-amber-600 tabular-nums">
                      −{item.out.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-[var(--apple-gray-100)] rounded-xl p-3 text-center">
                    <p className="text-[10px] font-semibold text-[var(--apple-text-secondary)] uppercase tracking-wide mb-1">Stock</p>
                    <p className="text-base font-bold text-[var(--apple-text)] tabular-nums">
                      {item.stock.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Spacer for mobile */}
        <div className="h-10 sm:h-0"></div>
      </div>
    </div>
  );
}
