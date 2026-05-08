"use client"

import { useEffect, useState } from "react"
import { useSellerProducts } from "@/hooks/useSellerProducts"
import { SellerProductTable } from "@/components/seller/product/SellerProductTable"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const TABS = [
  { label: "All",             key: "all" },
  { label: "Active",          key: "active" },
  { label: "Pending",         key: "pending" },
  { label: "Out of Stock",    key: "out_of_stock" },
  { label: "Hidden",          key: "hidden" },
]

export default function SellerProductsPage() {
  const [tab, setTab] = useState("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const LIMIT = 20

  useEffect(() => {
    document.title = "Products — Anozon Seller"
  }, [])

  const { data, isLoading } = useSellerProducts({ page, limit: LIMIT })

  const allProducts = data?.items ?? []

  // Client-side filtering
  const filtered = allProducts.filter((p) => {
    const matchesSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase())
    let matchesTab = true
    if (tab === "active")      matchesTab = p.is_active && p.is_approved
    if (tab === "pending")     matchesTab = !p.is_approved
    if (tab === "out_of_stock") matchesTab = p.stock === 0
    if (tab === "hidden")      matchesTab = p.is_approved && !p.is_active
    return matchesSearch && matchesTab
  })

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Products</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {data ? `${data.total} product${data.total !== 1 ? "s" : ""} in your store` : "Loading…"}
            </p>
          </div>
          <Link
            href="/seller/products/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm w-fit"
          >
            <Plus className="size-4" />
            Create Product
          </Link>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-0.5 flex-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setPage(1) }}
                className={cn(
                  "shrink-0 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap",
                  tab === t.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <SellerProductTable products={filtered} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
