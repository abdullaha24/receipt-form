import Head from "next/head";
import Link from "next/link";
import {
  ChevronRight,
  Inbox,
  Send,
  Factory,
  Settings,
  Package,
  Truck,
  Box,
} from "lucide-react";
import { useState } from "react";
import ApiSettingsModal from "../components/ApiSettingsModal";
import Logo from "../components/Logo";

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Entry Forms Section
  const entryFormCards = [
    {
      title: "Material Receipt",
      link: "/receipt",
      icon: <Inbox className="w-5 h-5" />,
      iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
      hoverBg: "group-hover:bg-emerald-50",
    },
    {
      title: "Material Issuance",
      link: "/issuance",
      icon: <Send className="w-5 h-5" />,
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      hoverBg: "group-hover:bg-amber-50",
    },
    {
      title: "Production Entry",
      link: "/production-entry",
      icon: <Factory className="w-5 h-5" />,
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      hoverBg: "group-hover:bg-blue-50",
    },
    {
      title: "DC Entry",
      link: "/dc-entry",
      icon: <Truck className="w-5 h-5" />,
      iconBg: "bg-gradient-to-br from-cyan-500 to-teal-600",
      hoverBg: "group-hover:bg-cyan-50",
    },
  ];

  // View Inventory Section
  const viewInventoryCards = [
    {
      title: "RM Inventory",
      link: "/rm-inventory",
      icon: <Package className="w-5 h-5" />,
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
      hoverBg: "group-hover:bg-violet-50",
      disabled: false,
    },
    {
      title: "FG Inventory",
      link: "#",
      icon: <Box className="w-5 h-5" />,
      iconBg: "bg-gradient-to-br from-slate-400 to-slate-500",
      hoverBg: "",
      disabled: true,
      badge: "Soon",
    },
  ];

  // Reusable compact tile component
  const CompactTile = ({ card }: { card: typeof entryFormCards[0] & { disabled?: boolean; badge?: string } }) => (
    <Link
      href={card.link}
      className={`group ${card.disabled ? "pointer-events-none" : ""}`}
    >
      <div
        className={`flex items-center gap-4 px-4 py-3.5 bg-white rounded-2xl border border-[var(--apple-border)]/40
          shadow-[var(--shadow-sm)] transition-all duration-200
          ${card.disabled ? "opacity-50" : `${card.hoverBg} hover:shadow-md hover:border-[var(--apple-border)]`}
          ${card.disabled ? "cursor-default" : "cursor-pointer active:scale-[0.98]"}`}
      >
        {/* Icon */}
        <div
          className={`${card.iconBg} p-2.5 rounded-xl text-white shadow-md shrink-0
            ${card.disabled ? "" : "group-hover:shadow-lg group-hover:scale-105"} transition-all duration-200`}
        >
          {card.icon}
        </div>

        {/* Title */}
        <span className="flex-1 font-semibold text-[15px] text-[var(--apple-text)]">
          {card.title}
        </span>

        {/* Badge or Arrow */}
        {card.badge ? (
          <span className="px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 rounded-full uppercase tracking-wider shrink-0">
            {card.badge}
          </span>
        ) : (
          <ChevronRight
            className="w-5 h-5 text-[var(--apple-text-secondary)] shrink-0
              group-hover:text-[var(--apple-blue)] group-hover:translate-x-0.5 transition-all duration-200"
          />
        )}
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-[var(--apple-bg)] flex flex-col">
      <Head>
        <title>Data Entry System</title>
        <meta name="description" content="Central hub for factory tracking" />
      </Head>

      {/* Header with logo and settings */}
      <header className="w-full px-4 sm:px-8 py-3 flex justify-between items-center">
        <Logo size="md" />
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2.5 text-[var(--apple-text-secondary)] hover:text-[var(--apple-blue)] hover:bg-[var(--apple-blue)]/10 rounded-full transition-all duration-200 active:scale-95"
          title="API Settings"
        >
          <Settings size={22} strokeWidth={1.75} />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-8">
        <div className="max-w-xl w-full">
          {/* Title Section */}
          <div className="text-center mb-10 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--apple-text)] tracking-tight leading-tight">
              Rawat Factory
            </h1>
            <p className="text-xl sm:text-2xl text-[var(--apple-text-secondary)] font-normal mt-1">
              Data Entry System
            </p>
          </div>

          {/* Entry Forms Section */}
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-[var(--apple-text-secondary)] uppercase tracking-wider mb-3 px-1">
              Entry Forms
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {entryFormCards.map((card) => (
                <CompactTile key={card.title} card={card} />
              ))}
            </div>
          </section>

          {/* View Inventory Section */}
          <section>
            <h2 className="text-xs font-semibold text-[var(--apple-text-secondary)] uppercase tracking-wider mb-3 px-1">
              View Inventory
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {viewInventoryCards.map((card) => (
                <CompactTile key={card.title} card={card} />
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-12 text-center">
            <p className="text-[var(--apple-text-secondary)] text-xs">
              &copy; {new Date().getFullYear()} Mitchell Construction Chemicals
            </p>
          </footer>
        </div>
      </main>

      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
