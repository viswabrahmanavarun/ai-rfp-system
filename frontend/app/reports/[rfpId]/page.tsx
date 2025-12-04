// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "../../../lib/api";
import jsPDF from "jspdf";

export default function ReportPage() {
  const params = useParams();
  const rfpId = params.rfpId;

  const [rfp, setRfp] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    loadReport();
  }, [rfpId]);

  async function loadReport() {
    try {
      const res = await api.get(`/api/reports/${rfpId}`);

      setRfp(res.data.rfp);
      setResults(res.data.results || []);
    } catch (err) {
      console.error("Failed to load report", err);
    }
  }

  // 👉 DOWNLOAD JSON FILE
  function downloadJSON() {
    const data = { rfp, results };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${rfp.title}-report.json`;
    a.click();
  }

  // 👉 DOWNLOAD PDF
  function downloadPDF() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`RFP Report - ${rfp.title}`, 10, 20);

    doc.setFontSize(12);
    doc.text(`RFP ID: ${rfp._id}`, 10, 35);
    if (rfp.budget) doc.text(`Budget: ${rfp.budget}`, 10, 45);
    if (rfp.delivery_timeline) doc.text(`Delivery: ${rfp.delivery_timeline}`, 10, 55);

    let y = 70;

    results.forEach((r, idx) => {
      doc.setFontSize(14);
      doc.text(`${idx + 1}. ${r.vendorName} (${r.vendorEmail})`, 10, y);
      y += 10;

      doc.setFontSize(12);
      doc.text(`Total Score: ${r.totalScore}`, 10, y);
      y += 8;

      doc.text(`Price Score: ${r.scores.priceScore}`, 10, y);
      y += 8;

      doc.text(`Delivery Score: ${r.scores.deliveryScore}`, 10, y);
      y += 8;

      doc.text(`Warranty Score: ${r.scores.warrantyScore}`, 10, y);
      y += 8;

      doc.text(`Item Score: ${r.scores.itemScore}`, 10, y);
      y += 12;

      // If page is full → add new page
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`${rfp.title}-report.pdf`);
  }

  if (!rfp)
    return <div className="p-8 text-center text-lg">Loading report...</div>;

  return (
    <div className="p-10 max-w-6xl mx-auto">

      {/* TITLE */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold">📄 Report - {rfp.title}</h1>

        <div className="flex gap-4">
          {/* JSON BUTTON */}
          <button
            onClick={downloadJSON}
            className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded shadow"
          >
            Download JSON
          </button>

          {/* PDF BUTTON */}
          <button
            onClick={downloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* RFP DETAILS */}
      <div className="mb-8 p-6 border rounded-xl bg-gray-50 shadow">
        <h2 className="text-xl font-semibold mb-4">RFP Details</h2>
        <div className="space-y-2 text-gray-700">
          <div><strong>ID:</strong> {rfp._id}</div>
          {rfp.budget && <div><strong>Budget:</strong> {rfp.budget}</div>}
          {rfp.delivery_timeline && (
            <div><strong>Delivery:</strong> {rfp.delivery_timeline}</div>
          )}
        </div>
      </div>

      {/* COMPARISON HEADER */}
      <h2 className="text-3xl font-bold mb-4">Vendor Comparison Results</h2>

      {results.length === 0 && (
        <p className="text-gray-500 text-lg">No proposals found for this RFP.</p>
      )}

      <div className="space-y-6">
        {results.map((r, idx) => (
          <div
            key={idx}
            className="p-6 bg-white shadow-lg border rounded-xl hover:shadow-2xl transition-all"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <div className="text-xl font-semibold">
                {idx + 1}. {r.vendorName}{" "}
                <span className="text-gray-500">({r.vendorEmail})</span>
              </div>
              <div className="text-lg">
                ⭐ Total Score:
                <span className="font-bold text-green-600"> {r.totalScore}</span>
              </div>
            </div>

            {/* SCORE GRID */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg shadow-sm">
                <div className="text-sm text-gray-500">Price Score</div>
                <div className="text-xl font-bold">{r.scores.priceScore}</div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg shadow-sm">
                <div className="text-sm text-gray-500">Delivery Score</div>
                <div className="text-xl font-bold">{r.scores.deliveryScore}</div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg shadow-sm">
                <div className="text-sm text-gray-500">Warranty Score</div>
                <div className="text-xl font-bold">{r.scores.warrantyScore}</div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg shadow-sm">
                <div className="text-sm text-gray-500">Item Score</div>
                <div className="text-xl font-bold">{r.scores.itemScore}</div>
              </div>
            </div>

            {/* EXTRACTED DATA */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Extracted Proposal Data</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-80 shadow-inner">
                {JSON.stringify(r.extracted, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
