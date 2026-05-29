"use client"

import { useState, useEffect, useMemo } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminAuth from "@/components/admin/AdminAuth"
import { Cake, Cookie, Search, Download, Check, X, Trash2, Eye, CheckCircle } from "lucide-react"
import {
  WORKSHOP_NAME_PREORDER_BLTM as PREORDER_NAME,
  type AdminRegistration as Registration,
} from "@/lib/registration-types"

export default function PreorderBLTMAdminPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [detail, setDetail] = useState<Registration | null>(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch(
        `/api/admin/workshops?limit=500&workshopName=${encodeURIComponent(PREORDER_NAME)}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch")
      const rows: Registration[] = (data.registrations || []).filter(
        (r: Registration) => !r.deletedAt && r.workshopName === PREORDER_NAME
      )
      setRegistrations(rows)
    } catch (err) {
      console.error("Error fetching preorder BLTM:", err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return registrations
    return registrations.filter((r) => {
      const name = (r.customer?.name || "").toLowerCase()
      const email = (r.customer?.email || "").toLowerCase()
      const phone = (r.phone || r.customer?.phone || "").toLowerCase()
      return name.includes(q) || email.includes(q) || phone.includes(q)
    })
  }, [registrations, search])

  const totalCakes = useMemo(
    () => registrations.reduce((s, r) => s + (r.preorderQuantity || 0), 0),
    [registrations]
  )
  const deliveredCount = useMemo(
    () => registrations.filter((r) => r.attended).length,
    [registrations]
  )
  const pendingCount = registrations.length - deliveredCount

  const formatDateTime = (s: string | null) => {
    if (!s) return "—"
    return new Date(s).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  }

  const toggleDelivered = async (r: Registration) => {
    try {
      const res = await fetch(`/api/admin/workshops/${r.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attended: !r.attended }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Update failed")
      }
      setRegistrations((prev) =>
        prev.map((x) =>
          x.id === r.id
            ? { ...x, attended: !r.attended, attendanceDate: !r.attended ? new Date().toISOString() : x.attendanceDate }
            : x
        )
      )
      setDetail((d) => (d && d.id === r.id ? { ...d, attended: !r.attended } : d))
    } catch (err: any) {
      alert("Lỗi cập nhật trạng thái: " + err.message)
    }
  }

  const remove = async (r: Registration) => {
    if (!confirm(`Xoá đơn của "${r.customer?.name || "khách"}"? (xoá mềm, có thể khôi phục trong DB)`)) return
    try {
      const res = await fetch(`/api/admin/workshops/${r.id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Delete failed")
      }
      setRegistrations((prev) => prev.filter((x) => x.id !== r.id))
      setDetail((d) => (d && d.id === r.id ? null : d))
    } catch (err: any) {
      alert("Lỗi xoá: " + err.message)
    }
  }

  const csvCell = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v)
    return `"${s.replace(/"/g, '""')}"`
  }

  const exportCSV = () => {
    const header = ["Ngày đặt", "Tên", "Email", "SĐT", "Số lượng", "Ghi chú khách", "Ghi chú thêm", "Đã giao"]
    const rows = filtered.map((r) => [
      formatDateTime(r.registrationDate),
      r.customer?.name || "",
      r.customer?.email || "",
      r.phone || r.customer?.phone || "",
      r.preorderQuantity ?? "",
      r.specificQuestions || "",
      r.otherNotes || "",
      r.attended ? "Có" : "Chưa",
    ])
    const csv = "﻿" + [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `preorder-bltm-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg p-5">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${color}`}>{icon}</div>
        <div className="ml-5">
          <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
          <dd className="text-2xl font-semibold text-gray-900">{loading ? "..." : value}</dd>
        </div>
      </div>
    </div>
  )

  return (
    <AdminAuth>
      <AdminSidebar>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pre-Order Bánh Bông Lan Trứng Muối</h1>
            <p className="mt-1 text-sm text-gray-500">
              Danh sách khách đặt trước từ trang <span className="font-mono">/preorderBLTM</span> — đổ về tự động qua form.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            <StatCard icon={<Cake className="h-6 w-6" />} label="Tổng đơn" value={registrations.length} color="text-[#083121]" />
            <StatCard icon={<Cookie className="h-6 w-6" />} label="Tổng bánh" value={totalCakes} color="text-[#fcc56c]" />
            <StatCard icon={<CheckCircle className="h-6 w-6" />} label="Đã giao" value={deliveredCount} color="text-green-600" />
            <StatCard icon={<X className="h-6 w-6" />} label="Chưa giao" value={pendingCount} color="text-red-600" />
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên / email / SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#083121]"
              />
            </div>
            <button
              onClick={exportCSV}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#083121] text-white rounded-md text-sm hover:bg-[#0a3d29] disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Xuất CSV
            </button>
          </div>

          {/* Table */}
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SĐT</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">SL</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">Đang tải...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">Chưa có đơn pre-order nào.</td></tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDateTime(r.registrationDate)}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium text-gray-900">{r.customer?.name || "—"}</div>
                          <div className="text-gray-500 text-xs">{r.customer?.email || ""}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{r.phone || r.customer?.phone || "—"}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{r.preorderQuantity ?? "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={r.specificQuestions || ""}>
                          {r.specificQuestions || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => toggleDelivered(r)}
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              r.attended
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {r.attended ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                            {r.attended ? "Đã giao" : "Chưa giao"}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right text-sm whitespace-nowrap">
                          <button onClick={() => setDetail(r)} className="text-[#083121] hover:text-[#0a3d29] mr-3" title="Xem chi tiết">
                            <Eye className="h-4 w-4 inline" />
                          </button>
                          <button onClick={() => remove(r)} className="text-red-600 hover:text-red-800" title="Xoá">
                            <Trash2 className="h-4 w-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail modal */}
          {detail && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={() => setDetail(null)}
            >
              <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Chi tiết đơn pre-order</h2>
                      <p className="text-sm text-gray-500 mt-1">{formatDateTime(detail.registrationDate)}</p>
                    </div>
                    <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between border-b pb-2"><dt className="text-gray-500">Tên</dt><dd className="font-medium text-gray-900">{detail.customer?.name || "—"}</dd></div>
                    <div className="flex justify-between border-b pb-2"><dt className="text-gray-500">Email</dt><dd className="text-gray-900">{detail.customer?.email || "—"}</dd></div>
                    <div className="flex justify-between border-b pb-2"><dt className="text-gray-500">SĐT</dt><dd className="text-gray-900">{detail.phone || detail.customer?.phone || "—"}</dd></div>
                    <div className="flex justify-between border-b pb-2"><dt className="text-gray-500">Số lượng</dt><dd className="font-semibold text-gray-900">{detail.preorderQuantity ?? "—"} cái</dd></div>
                    {detail.specificQuestions && (
                      <div className="border-b pb-2">
                        <dt className="text-gray-500 mb-1">Ghi chú từ khách</dt>
                        <dd className="text-gray-900 whitespace-pre-wrap">{detail.specificQuestions}</dd>
                      </div>
                    )}
                    {detail.otherNotes && (
                      <div className="border-b pb-2">
                        <dt className="text-gray-500 mb-1">Ghi chú thêm</dt>
                        <dd className="text-gray-900 whitespace-pre-wrap">{detail.otherNotes}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Trạng thái</dt>
                      <dd className={detail.attended ? "text-green-700 font-medium" : "text-gray-700"}>
                        {detail.attended ? "Đã giao" : "Chưa giao"}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-6 flex gap-2 justify-end">
                    <button
                      onClick={() => toggleDelivered(detail)}
                      className="px-4 py-2 text-sm bg-[#083121] text-white rounded-md hover:bg-[#0a3d29]"
                    >
                      {detail.attended ? "Đánh dấu chưa giao" : "Đánh dấu đã giao"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminSidebar>
    </AdminAuth>
  )
}
