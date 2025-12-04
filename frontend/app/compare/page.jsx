"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function CompareProposalsPage() {
  const [rfps, setRfps] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [selectedRfp, setSelectedRfp] = useState("");
  const [selectedVendors, setSelectedVendors] = useState([]);

  const [loading, setLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);

  // Load RFP + Vendor data
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const r = await api.get("/api/rfp/all");
    const v = await api.get("/api/vendors/all");

    const rfpList = r.data?.data || [];
    const vendorList = v.data?.data || [];

    const uniqueRfps = [];
    const seenRfps = new Set();
    rfpList.forEach((r) => {
      if (!seenRfps.has(r.title)) {
        seenRfps.add(r.title);
        uniqueRfps.push(r);
      }
    });

    const uniqueVendors = [];
    const seenEmails = new Set();
    vendorList.forEach((v) => {
      if (!seenEmails.has(v.email)) {
        seenEmails.add(v.email);
        uniqueVendors.push(v);
      }
    });

    setRfps(uniqueRfps);
    setVendors(uniqueVendors);
  }

  async function compareProposals() {
    if (!selectedRfp) return alert("Please select an RFP");
    if (selectedVendors.length === 0)
      return alert("Please select at least one vendor");

    setLoading(true);

    try {
      const res = await api.post("/api/proposals/compare", {
        rfpId: selectedRfp,
        vendorEmails: selectedVendors,
      });

      const result = res.data;

      if (!result.success) {
        alert(result.message || "No proposals found");
        setLoading(false);
        return;
      }

      setComparisonResult(result);
    } catch (err) {
      console.error("COMPARE ERROR:", err);
      alert("Error comparing proposals");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto p-10">

      <h1 className="text-4xl font-extrabold mb-10 flex items-center gap-3 text-gray-900">
        <span className="text-orange-600 text-5xl">⚖️</span>
        Compare Vendor Proposals
      </h1>

      <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-200 mb-10 transition-all duration-300 hover:shadow-2xl">

        {/* RFP SELECT */}
        <label className="font-semibold mb-2 block text-gray-700">Select RFP</label>
        <select
          value={selectedRfp}
          onChange={(e) => setSelectedRfp(e.target.value)}
          className="border w-full p-3 rounded-lg mb-8 bg-gray-50 focus:ring-2 focus:ring-orange-400 transition"
        >
          <option value="">-- Select RFP --</option>
          {rfps.map((r) => (
            <option key={r._id} value={r._id}>
              {r.title}
            </option>
          ))}
        </select>

        {/* VENDORS SELECT */}
        <label className="font-semibold mb-2 block text-gray-700">Select Vendors</label>
        <select
          multiple
          value={selectedVendors}
          onChange={(e) =>
            setSelectedVendors(
              Array.from(e.target.selectedOptions, (opt) => opt.value)
            )
          }
          className="border w-full p-3 rounded-lg mb-6 h-40 bg-gray-50 focus:ring-2 focus:ring-orange-400 transition"
        >
          {vendors.map((v) => (
            <option key={v._id} value={v.email}>
              {v.name} ({v.email})
            </option>
          ))}
        </select>

        {/* BUTTON */}
        <button
          onClick={compareProposals}
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg shadow-md transition transform hover:scale-105 disabled:bg-gray-400"
        >
          {loading ? "Comparing..." : "Compare Proposals"}
        </button>
      </div>

      {/* RESULT */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Comparison Result</h2>

        {!comparisonResult && (
          <p className="text-gray-500">Comparison results will appear here...</p>
        )}

        {comparisonResult && (
          <div className="mt-4 p-5 bg-gray-50 rounded-xl border overflow-auto shadow-inner animate-fadeIn">
            <pre className="whitespace-pre-wrap text-sm text-gray-800">
              {JSON.stringify(comparisonResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
}
