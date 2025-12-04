"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function ReportsListPage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const res = await api.get("/api/rfp/all");
      setReports(res.data.data || []);
    } catch (err) {
      console.error("Failed to load reports", err);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-10">
      <h1 className="text-4xl font-extrabold mb-8">📊 Reports</h1>

      <div className="space-y-4">
        {reports.length === 0 && (
          <p className="text-gray-500">No reports available.</p>
        )}

        {reports.map((r, index) => (
          <div
            key={r._id}
            className="p-5 rounded-xl bg-white border shadow-md hover:shadow-xl transition-all cursor-pointer flex justify-between items-center"
          >
            {/* LEFT SECTION */}
            <div>
              <div className="text-lg font-semibold">{index + 1}. {r.title}</div>
              <div className="text-gray-500 text-sm">
                Created: {new Date(r.createdAt).toLocaleString()}
              </div>
            </div>

            {/* RIGHT SECTION */}
            <Link
              href={`/reports/${r._id}`}
              className="text-blue-600 hover:text-blue-800 font-medium underline"
            >
              View Report →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
