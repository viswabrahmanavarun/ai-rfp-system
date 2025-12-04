"use client";

import { useEffect, useState } from "react";
import api from "../../../../lib/api";
import { useParams } from "next/navigation";

interface Vendor {
  _id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
}

interface RFP {
  _id: string;
  title: string;
  description?: string;
  requirements?: string;
  createdAt: string;
}

export default function SendRFPPage() {
  const params = useParams();
  const rfpId = params.id as string; // FIX red underline

  const [rfp, setRfp] = useState<RFP | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // Load RFP + Vendors
  useEffect(() => {
    loadRfp();
    loadVendors();
  }, []);

  // -------------------------------------------
  // Load RFP details
  // -------------------------------------------
  async function loadRfp() {
    try {
      const res = await api.get(`/api/rfp/${rfpId}`);
      setRfp(res.data as RFP);
    } catch (err) {
      console.error("Failed to load RFP:", err);
    }
  }

  // -------------------------------------------
  // Load vendors
  // -------------------------------------------
  async function loadVendors() {
    try {
      const res = await api.get(`/api/vendors/all`);
      const list = res.data?.data as Vendor[] || [];

      const init: Record<string, boolean> = {};
      list.forEach((v) => {
        init[v._id] = false;
      });

      setVendors(list);
      setSelected(init);
    } catch (err) {
      console.error("Failed to load vendors:", err);
    }
  }

  // -------------------------------------------
  // Toggle checkbox
  // -------------------------------------------
  function toggle(id: string) {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  // -------------------------------------------
  // Send RFP
  // -------------------------------------------
  async function send() {
    const vendorIds = Object.keys(selected).filter((id) => selected[id]);

    if (vendorIds.length === 0) return alert("Select at least one vendor");

    setLoading(true);

    try {
      await api.post(`/api/proposals/send`, {
        rfpId,
        vendorIds,
      });

      alert("RFP sent successfully!");
    } catch (err: any) {
      alert("Failed: " + err.message);
    }

    setLoading(false);
  }

  // -------------------------------------------
  // UI
  // -------------------------------------------
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Send RFP to Vendors</h1>

      {rfp && (
        <div className="mb-6 p-4 bg-gray-100 border rounded">
          <div className="font-bold">RFP: {rfp.title}</div>
          <div className="text-gray-700 text-sm">ID: {rfpId}</div>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">Select Vendors</h2>

      <div className="border rounded p-3 max-h-72 overflow-auto mb-4">
        {vendors.length === 0 && (
          <p className="text-gray-500">No vendors found.</p>
        )}

        {vendors.map((v) => (
          <label
            key={v._id}
            className="flex items-center gap-3 p-2 border-b cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected[v._id] || false}
              onChange={() => toggle(v._id)}
            />
            <div>
              <div className="font-medium">
                {v.name} — {v.company}
              </div>
              <div className="text-sm text-gray-600">{v.email}</div>
            </div>
          </label>
        ))}
      </div>

      <button
        disabled={loading}
        onClick={send}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {loading ? "Sending..." : "Send RFP"}
      </button>
    </div>
  );
}
