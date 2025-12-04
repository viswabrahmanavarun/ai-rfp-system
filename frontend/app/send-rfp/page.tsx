"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Send,
  ClipboardList,
  Users,
  Mail,
  Loader2,
  FileSearch,
} from "lucide-react";

export default function SendRFP() {
  const [rfps, setRfps] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedRfp, setSelectedRfp] = useState("");
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const r = await api.get("/api/rfp/all");
      const v = await api.get("/api/vendors/all");

      setRfps(r.data.data || []);
      setVendors(v.data.data || []);
    } catch (err) {
      console.error("Failed to load data:", err);
    }

    setPageLoading(false);
  }

  function toggleVendor(id: string) {
    setSelectedVendors((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  async function sendRfp() {
    if (!selectedRfp) {
      alert("Please select an RFP");
      return;
    }
    if (selectedVendors.length === 0) {
      alert("Please select at least one vendor");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/proposals/send", {
        rfpId: selectedRfp,
        vendorIds: selectedVendors,
      });

      alert("RFP sent successfully!");
    } catch (err: any) {
      alert(err?.message || "Failed to send RFP");
    }

    setLoading(false);
  }

  if (pageLoading) {
    return (
      <div className="p-10 text-center text-gray-500">
        <Loader2 className="animate-spin mx-auto mb-3" />
        Loading modules...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto p-8"
    >
      {/* Page Title */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 text-transparent bg-clip-text"
      >
        Send RFP to Vendors
      </motion.h1>

      <p className="text-gray-600 mt-2 mb-10">
        Select an RFP and choose vendors to send it to.
      </p>

      {/* RFP SELECT CARD */}
      <Card className="p-6 mb-8 shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <ClipboardList className="text-blue-600" />
          <h2 className="text-xl font-semibold">Select RFP</h2>
        </div>

        <select
          className="w-full border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
          value={selectedRfp}
          onChange={(e) => setSelectedRfp(e.target.value)}
        >
          <option value="">Choose an RFP...</option>

          {rfps.map((rfp: any) => (
            <option key={rfp._id} value={rfp._id}>
              {rfp.title}
            </option>
          ))}
        </select>
      </Card>

      {/* VENDOR SELECT CARD */}
      <Card className="p-6 shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <Users className="text-purple-600" />
          <h2 className="text-xl font-semibold">Select Vendors</h2>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-3">
          {vendors.length === 0 && (
            <div className="text-gray-500 flex items-center gap-2">
              <FileSearch size={18} /> No vendors found.
            </div>
          )}

          {vendors.map((v: any, index: number) => (
            <motion.label
              key={v._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={selectedVendors.includes(v._id)}
                onChange={() => toggleVendor(v._id)}
              />

              <div>
                <p className="font-medium">{v.name}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Mail size={14} /> {v.email}
                </p>
              </div>
            </motion.label>
          ))}
        </div>
      </Card>

      {/* SEND BUTTON */}
      <Button
        onClick={sendRfp}
        disabled={loading}
        className="mt-8 bg-green-600 hover:bg-green-700 text-white text-lg px-6 py-3 rounded-lg flex items-center gap-2 shadow-md"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <Send size={20} />
        )}
        {loading ? "Sending..." : "Send RFP"}
      </Button>
    </motion.div>
  );
}
