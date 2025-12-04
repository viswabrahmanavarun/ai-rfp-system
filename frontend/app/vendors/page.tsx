"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pen,
  Trash2,
  Loader2,
  UserPlus,
  Mail,
  Building,
  Phone,
  X,
} from "lucide-react";

type Vendor = {
  _id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);

  // Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadVendors();
  }, []);

  async function loadVendors() {
    try {
      setLoading(true);
      const res = await api.get("/api/vendors/all");
      setVendors(res.data?.data || []);
    } catch (err) {
      console.error("Error loading vendors:", err);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditing(null);
    setName("");
    setEmail("");
    setCompany("");
    setPhone("");
    setIsModalOpen(true);
  }

  function openEditModal(v: Vendor) {
    setEditing(v);
    setName(v.name);
    setEmail(v.email);
    setCompany(v.company);
    setPhone(v.phone || "");
    setIsModalOpen(true);
  }

  async function saveVendor() {
    if (!name || !email || !company) {
      alert("Name, Email and Company are required.");
      return;
    }

    setSaving(true);

    try {
      if (editing) {
        await api.post(`/api/vendors/update/${editing._id}`, {
          name,
          email,
          company,
          phone,
        });
      } else {
        await api.post(`/api/vendors/create`, {
          name,
          email,
          company,
          phone,
        });
      }

      await loadVendors();
      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to save vendor");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function deleteVendor(id: string) {
    if (!confirm("Delete this vendor?")) return;

    try {
      await api.post(`/api/vendors/delete/${id}`);
      await loadVendors();
    } catch (err) {
      alert("Failed to delete vendor");
      console.error(err);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Vendors</h1>
          <p className="text-gray-600 mt-1">Add, edit and manage vendor contacts.</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex gap-2 items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <Plus size={16} />
          Add Vendor
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-5 px-6 py-3 border-b bg-gray-50 text-sm font-semibold text-gray-600">
          <div>Name</div>
          <div>Email</div>
          <div>Company</div>
          <div>Phone</div>
          <div className="text-center">Actions</div>
        </div>

        {/* Table Rows */}
        <div>
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No vendors found.</div>
          ) : (
            <AnimatePresence>
              {vendors.map((v, i) => (
                <motion.div
                  key={v._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-5 px-6 py-4 items-center border-b hover:bg-gray-50"
                >
                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                      {v.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{v.name}</div>
                      <div className="text-xs text-gray-500">{v.company}</div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail size={15} className="text-gray-400" />
                    {v.email}
                  </div>

                  {/* Company */}
                  <div className="flex items-center gap-2 text-gray-700">
                    <Building size={15} className="text-gray-400" />
                    {v.company}
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone size={15} className="text-gray-400" />
                    {v.phone || "-"}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openEditModal(v)}
                      className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 rounded text-white flex items-center gap-1"
                    >
                      <Pen size={14} />
                      Edit
                    </button>

                    <button
                      onClick={() => deleteVendor(v._id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* MODAL — Add / Edit Vendor */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
            >
              <div className="bg-white shadow-xl rounded-lg w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <UserPlus size={20} className="text-blue-600" />
                    {editing ? "Edit Vendor" : "Add Vendor"}
                  </h2>

                  <button className="p-2 hover:bg-gray-100 rounded" onClick={() => setIsModalOpen(false)}>
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Name */}
                  <div>
                    <label className="font-medium text-sm">Name</label>
                    <input
                      className="w-full border rounded p-2 mt-1"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="font-medium text-sm">Email</label>
                    <input
                      className="w-full border rounded p-2 mt-1"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="font-medium text-sm">Company</label>
                    <input
                      className="w-full border rounded p-2 mt-1"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="font-medium text-sm">Phone</label>
                    <input
                      className="w-full border rounded p-2 mt-1"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 p-4 border-t">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>

                  <button
                    disabled={saving}
                    onClick={saveVendor}
                    className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                    {saving ? "Saving..." : editing ? "Update Vendor" : "Add Vendor"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
