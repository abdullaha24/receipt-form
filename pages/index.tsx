import Head from "next/head";
import Link from "next/link";
import { ArrowRight, Inbox, Send, Factory } from 'lucide-react';

export default function Home() {
  const cards = [
    {
      title: "Material Receipt",
      description: "Record incoming raw materials and inventory.",
      link: "/receipt",
      icon: <Inbox className="w-8 h-8 text-emerald-600" />,
      color: "hover:border-emerald-500 hover:shadow-emerald-100",
      btnColor: "text-emerald-600 group-hover:text-emerald-700"
    },
    {
      title: "Material Issuance",
      description: "Log materials issued for production or usage.",
      link: "/issuance",
      icon: <Send className="w-8 h-8 text-amber-600" />,
      color: "hover:border-amber-500 hover:shadow-amber-100",
      btnColor: "text-amber-600 group-hover:text-amber-700"
    },
    {
      title: "Production Entry",
      description: "Enter daily finished goods production data.",
      link: "/production-entry",
      icon: <Factory className="w-8 h-8 text-blue-600" />,
      color: "hover:border-blue-500 hover:shadow-blue-100",
      btnColor: "text-blue-600 group-hover:text-blue-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Head>
        <title>Data Entry System</title>
        <meta name="description" content="Central hub for factory tracking" />
      </Head>

      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            Rawat Factory Data Entry System
          </h1>
          <p className="text-xl text-gray-500">
            Select an action below to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link href={card.link} key={card.title} className="group">
              <div className={`h-full bg-white p-8 rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 ${card.color} hover:shadow-lg flex flex-col items-center text-center cursor-pointer`}>
                <div className="p-4 bg-gray-50 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                <p className="text-gray-500 mb-8 flex-grow">{card.description}</p>
                <div className={`flex items-center gap-2 font-semibold ${card.btnColor}`}>
                  Open Form
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-12 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Mitchell Construction Chemicals
        </div>
      </div>
    </div>
  );
}
