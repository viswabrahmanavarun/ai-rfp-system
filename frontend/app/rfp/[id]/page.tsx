"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/api";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  Package,
  CreditCard,
  Shield,
  FileText,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RfpDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rfpId = params.id;

  const [rfp, setRfp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRfp();
  }, [rfpId]);

  async function loadRfp() {
    try {
      const res = await api.get(`/api/rfp/${rfpId}`);
      setRfp(res.data);
    } catch (err) {
      console.error("Failed to load RFP", err);
    }
    setLoading(false);
  }

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Loading RFP details…</div>
    );

  if (!rfp)
    return (
      <div className="p-10 text-center">
        <p className="text-gray-600">RFP not found.</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto p-8"
    >
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 hover:bg-gray-200"
      >
        <ArrowLeft size={18} />
        Back
      </Button>

      {/* Title & Created Date */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text"
      >
        {rfp.title}
      </motion.h1>

      <div className="flex items-center gap-2 text-gray-600 mt-2">
        <Calendar size={16} />
        <span>Created: {new Date(rfp.createdAt).toLocaleDateString()}</span>
      </div>

      {/* CONTENT SECTIONS */}
      <div className="mt-10 space-y-8">
        {/* Description */}
        <DetailSection title="Description" icon={<ClipboardList size={20} />}>
          <p className="text-gray-700 leading-relaxed">
            {rfp.description || "N/A"}
          </p>
        </DetailSection>

        {/* Requirements */}
        <DetailSection title="Requirements" icon={<ClipboardList size={20} />}>
          <div className="bg-gray-50 p-4 rounded-lg border text-gray-700">
            {Array.isArray(rfp.requirements)
              ? rfp.requirements.join(", ")
              : rfp.requirements || "N/A"}
          </div>
        </DetailSection>

        {/* Budget */}
        <DetailSection title="Budget" icon={<CreditCard size={20} />}>
          <div className="bg-gray-50 p-4 rounded-lg border">
            {rfp.budget || "N/A"}
          </div>
        </DetailSection>

        {/* Delivery Timeline */}
        <DetailSection
          title="Delivery Timeline"
          icon={<Calendar size={20} />}
        >
          <div className="bg-gray-50 p-4 rounded-lg border">
            {rfp.delivery_timeline || "N/A"}
          </div>
        </DetailSection>

        {/* Items */}
        <DetailSection title="Items" icon={<Package size={20} />}>
          {rfp.items && rfp.items.length > 0 ? (
            <Card className="overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 border">Name</th>
                    <th className="p-3 border">Quantity</th>
                    <th className="p-3 border">Specs</th>
                    <th className="p-3 border">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {rfp.items.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="p-3 border">{item.name || "—"}</td>
                      <td className="p-3 border">{item.quantity || "—"}</td>
                      <td className="p-3 border text-gray-600">
                        {item.specs || "—"}
                      </td>
                      <td className="p-3 border">{item.unit || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ) : (
            <p className="text-gray-500">No items listed.</p>
          )}
        </DetailSection>

        {/* Payment Terms */}
        <DetailSection title="Payment Terms" icon={<FileText size={20} />}>
          <div className="bg-gray-50 p-4 rounded-lg border">
            {rfp.payment_terms || "N/A"}
          </div>
        </DetailSection>

        {/* Warranty */}
        <DetailSection title="Warranty" icon={<Shield size={20} />}>
          <div className="bg-gray-50 p-4 rounded-lg border">
            {rfp.warranty || "N/A"}
          </div>
        </DetailSection>

        {/* Raw Text */}
        <DetailSection title="Raw Text" icon={<FileText size={20} />}>
          <pre className="bg-black text-green-400 p-4 rounded border overflow-auto text-sm leading-relaxed">
            {rfp.raw_text}
          </pre>
        </DetailSection>
      </div>

      {/* Send RFP Button */}
      <Button
        className="bg-blue-600 text-white px-6 py-3 rounded-lg mt-10 shadow hover:bg-blue-700 transition-all"
        onClick={() => router.push(`/rfp/${rfpId}/send`)}
      >
        Send RFP to Vendors
      </Button>
    </motion.div>
  );
}

/* ---------------------------
   Reusable Animated Section 
----------------------------*/
function DetailSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2 text-xl font-semibold">
        {icon}
        {title}
      </div>
      {children}
    </motion.div>
  );
}
