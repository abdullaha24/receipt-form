import Head from "next/head";
import Link from "next/link";
import { ArrowRight, Inbox, Send, Factory, Settings } from 'lucide-react';
import { useState } from 'react';
import ApiSettingsModal from '../components/ApiSettingsModal';

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const cards = [
    {
      title: "Material Receipt",
      description: "Record incoming raw materials and inventory.",
      link: "/receipt",
      icon: <Inbox className="w-7 h-7" />,
      gradient: "from-emerald-500 to-green-600",
      iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
      hoverBorder: "hover:border-emerald-400/50",
      hoverShadow: "hover:shadow-emerald-500/10"
    },
    {
      title: "Material Issuance",
      description: "Log materials issued for production or usage.",
      link: "/issuance",
      icon: <Send className="w-7 h-7" />,
      gradient: "from-amber-500 to-orange-600",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      hoverBorder: "hover:border-amber-400/50",
      hoverShadow: "hover:shadow-amber-500/10"
    },
    {
      title: "Production Entry",
      description: "Enter daily finished goods production data.",
      link: "/production-entry",
      icon: <Factory className="w-7 h-7" />,
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      hoverBorder: "hover:border-blue-400/50",
      hoverShadow: "hover:shadow-blue-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--apple-bg)] flex flex-col">
      <Head>
        <title>Data Entry System</title>
        <meta name="description" content="Central hub for factory tracking" />
      </Head>

      {/* Header with settings button */}
      <header className="w-full px-4 sm:px-8 py-4 flex justify-end">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 text-[var(--apple-text-secondary)] hover:text-[var(--apple-blue)] hover:bg-[var(--apple-blue)]/10 rounded-full transition-all duration-200 active:scale-95"
          title="API Settings"
        >
          <Settings size={24} strokeWidth={1.75} />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-12">
        <div className="max-w-5xl w-full">
          {/* Title Section */}
          <div className="text-center mb-14">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[var(--apple-text)] tracking-tight mb-4 leading-tight">
              Rawat Factory
              <span className="block text-[var(--apple-text-secondary)] font-normal text-3xl sm:text-4xl lg:text-5xl mt-2">
                Data Entry System
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-[var(--apple-text-secondary)] font-normal mt-6 max-w-2xl mx-auto">
              Select an action below to get started.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {cards.map((card) => (
              <Link href={card.link} key={card.title} className="group">
                <div 
                  className={`h-full bg-white p-7 sm:p-8 rounded-2xl border border-[var(--apple-border)]/50 
                    shadow-[var(--shadow-card)] transition-all duration-300 
                    ${card.hoverBorder} ${card.hoverShadow}
                    hover:shadow-xl hover:-translate-y-1
                    flex flex-col items-center text-center cursor-pointer`}
                >
                  {/* Icon */}
                  <div className={`${card.iconBg} p-4 rounded-2xl mb-6 text-white shadow-lg 
                    group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                    {card.icon}
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold text-[var(--apple-text)] mb-2 tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-[var(--apple-text-secondary)] text-[15px] leading-relaxed mb-6 flex-grow">
                    {card.description}
                  </p>
                  
                  {/* Action Link */}
                  <div className="flex items-center gap-2 text-[var(--apple-blue)] font-medium text-[15px] 
                    group-hover:gap-3 transition-all duration-200">
                    <span>Open Form</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Footer */}
          <footer className="mt-16 text-center">
            <p className="text-[var(--apple-text-secondary)] text-sm">
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
