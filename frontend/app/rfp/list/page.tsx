"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "../../../lib/api";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  Calendar,
  Grid as GridIcon,
  List as ListIcon,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

type RFP = {
  _id: string;
  title: string;
  description?: string;
  createdAt: string;
  [k: string]: any;
};

export default function RfpListPage() {
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Controls
  const [query, setQuery] = useState<string>("");
  const [filter, setFilter] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Pagination
  const [page, setPage] = useState<number>(1);
  const perPage = 6;

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await api.get("/api/rfp/all");
      setRfps(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load RFPs:", err);
      setRfps([]);
    } finally {
      setLoading(false);
    }
  }

  // Search + Filter + Sort
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const f = filter.toLowerCase().trim();

    let list = rfps.filter((r) => {
      const t = (r.title || "").toLowerCase();
      const d = (r.description || "").toLowerCase();
      // apply query to title or description (makes search more useful)
      if (q && !t.includes(q) && !d.includes(q)) return false;
      if (f && !t.includes(f) && !d.includes(f)) return false;
      return true;
    });

    list = list.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? tb - ta : ta - tb;
    });

    return list;
  }, [rfps, query, filter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            All RFPs
          </h1>
          <p className="text-gray-500 mt-1">
            Search, filter, sort and view all proposals.
          </p>
        </div>

        {/* Create / Refresh */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => load()}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </Button>

          <Link href="/create-rfp">
            <Button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-all">
              Create RFP
            </Button>
          </Link>
        </div>
      </div>

      {/* Layout: Sidebar + Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* LEFT SIDEBAR */}
        <aside className="md:col-span-3 bg-white p-5 rounded-2xl shadow border space-y-5">
          {/* Search */}
          <div>
            <label className="text-sm font-medium text-gray-700">Search</label>
            <div className="relative mt-1">
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search titles or descriptions…"
                className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
              />
              <Search className="absolute left-2 top-2.5 text-gray-400" size={18} />
            </div>
          </div>

          {/* Filter */}
          <div>
            <label className="text-sm font-medium text-gray-600">Filter</label>
            <input
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Filter text…"
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Sort */}
          <div>
            <label className="text-sm font-medium text-gray-600">Sort</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* View Toggle */}
          <div>
            <label className="text-sm font-medium text-gray-600">View Mode</label>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md ${
                  viewMode === "grid" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                }`}
                aria-label="grid"
              >
                <GridIcon size={16} />
              </button>

              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md ${
                  viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                }`}
                aria-label="list"
              >
                <ListIcon size={16} />
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-2 pt-2 border-t">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-2xl font-semibold">{rfps.length}</div>
            <div className="text-sm text-gray-400 mt-1">Showing {filtered.length} matching</div>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <main className="md:col-span-9">
          {/* Loading skeleton */}
          {loading ? (
            <div
              className={`grid gap-4 ${
                viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              }`}
            >
              {Array.from({ length: perPage }).map((_, i) => (
                <div key={i} className="h-36 bg-gray-200 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {/* Cards area */}
              <div
                className={`grid gap-4 ${
                  viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                }`}
              >
                {pageItems.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full">
                    <div className="p-8 border rounded-xl text-center text-gray-500 bg-white">
                      No RFPs match your search/filters.
                    </div>
                  </motion.div>
                )}

                {pageItems.map((r, idx) => (
                  <motion.div
                    key={r._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.04 }}
                  >
                    {/* Card */}
                    <Card
                      className={`p-5 flex flex-col justify-between h-full transition hover:shadow-lg ${viewMode === "list" ? "md:flex-row md:items-center" : ""}`}
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{r.title}</h3>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                          <Calendar size={14} />
                          <span>Created: {new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* DESCRIPTION SNIPPET — line-clamped to 3 lines */}
                        {r.description ? (
                          <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                            {r.description}
                          </p>
                        ) : null}
                      </div>

                      <div className={`mt-4 ${viewMode === "list" ? "md:mt-0 md:ml-6" : ""}`}>
                        <Link href={`/rfp/${r._id}`}>
                          <Button className="flex items-center gap-2 bg-blue-600 text-white">
                            View
                            <ArrowRight size={14} />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} of {filtered.length}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-md bg-gray-100 disabled:opacity-50"
                  >
                    <ArrowLeft size={16} />
                  </button>

                  <div className="px-3 py-1 border rounded-md bg-white">
                    Page {page} / {totalPages}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-md bg-gray-100 disabled:opacity-50"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
