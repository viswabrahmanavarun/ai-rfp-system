"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PlusCircle,
  FileText,
  Send,
  Users,
  GitCompare,
  BarChart2,
  Sun,
  Moon,
  Bell,
} from "lucide-react";

// CHARTS
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

export default function Dashboard() {
  const [dark, setDark] = useState(false);

  const chartData = [
    { name: "Mon", value: 12 },
    { name: "Tue", value: 18 },
    { name: "Wed", value: 25 },
    { name: "Thu", value: 21 },
    { name: "Fri", value: 30 },
  ];

  const menu = [
    {
      title: "Create RFP",
      desc: "Generate AI-powered structured RFP",
      link: "/create-rfp",
      color: "from-blue-500 to-blue-700",
      icon: <PlusCircle size={34} />,
    },
    {
      title: "List All RFPs",
      desc: "View all created RFPs",
      link: "/rfp/list",
      color: "from-gray-700 to-gray-900",
      icon: <FileText size={34} />,
    },
    {
      title: "Send RFP to Vendors",
      desc: "Send RFP emails automatically",
      link: "/send-rfp",
      color: "from-green-500 to-green-700",
      icon: <Send size={34} />,
    },
    {
      title: "Manage Vendors",
      desc: "Add, edit, and manage vendors",
      link: "/vendors",
      color: "from-purple-500 to-purple-700",
      icon: <Users size={34} />,
    },
    {
      title: "Compare Proposals",
      desc: "AI comparison of vendor quotes",
      link: "/compare",
      color: "from-orange-500 to-orange-700",
      icon: <GitCompare size={34} />,
    },
    {
      title: "Reports",
      desc: "View & download comparison reports",
      link: "/reports",
      color: "from-red-500 to-red-700",
      icon: <BarChart2 size={34} />,
    },
  ];

  return (
    <div
      className={`min-h-screen p-10 transition-all ${
        dark ? "bg-gray-900 text-white" : "bg-gray-100"
      }`}
    >
      {/* Notification Bar */}
      <div className="mb-5 flex items-center gap-3 bg-yellow-200 border border-yellow-400 text-yellow-900 p-3 rounded-xl shadow">
        <Bell size={20} />
        <p className="font-medium text-sm">
          New Update: PDF generation is now fully automated! 🎉
        </p>
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI-Powered RFP System
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-300">
            Welcome! Choose a module to continue 🚀
          </p>
        </div>

        {/* DARK MODE TOGGLE */}
        <button
          onClick={() => setDark(!dark)}
          className="p-3 rounded-full bg-gray-300 dark:bg-gray-700 shadow hover:scale-110 transition"
        >
          {dark ? <Sun size={26} /> : <Moon size={26} />}
        </button>
      </div>

      {/* GRID MENU */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {menu.map((m) => (
          <Link key={m.title} href={m.link}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`bg-gradient-to-br ${m.color} text-white p-7 rounded-2xl shadow-xl cursor-pointer backdrop-blur-lg bg-opacity-90 border border-white/10 hover:shadow-2xl transition-all`}
            >
              <div className="mb-4">{m.icon}</div>
              <h2 className="text-3xl font-bold">{m.title}</h2>
              <p className="mt-2 text-gray-200 text-sm">{m.desc}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* REAL-TIME CHART SECTION */}
      <div className="mb-14 p-6 rounded-2xl shadow-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
        <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          Activity Overview
          <BarChart2 />
        </h3>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#aaa" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#4F46E5"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="p-6 rounded-2xl shadow-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
        <h3 className="text-2xl font-semibold mb-4">Recent Activity</h3>
        <ul className="space-y-3 text-gray-700 dark:text-gray-300">
          <li>• Krishna submitted a proposal for RFP #2024</li>
          <li>• Sand factory RFP generated successfully</li>
          <li>• Vendor list updated with 2 new vendors</li>
          <li>• PDF report downloaded for Office Furniture RFP</li>
        </ul>
      </div>
    </div>
  );
}
