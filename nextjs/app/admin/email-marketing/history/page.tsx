"use client"

import { useState, useEffect, useMemo } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminAuth from "@/components/admin/AdminAuth"
import { Search, History, Clock, X, Eye, Trash2 } from "lucide-react"

interface Campaign {
  id: number
  name: string
  category: string | null
  subject: string | null
  totalRecipients: number
  sentAt: string | null
  createdBy: string | null
  createdAt: string
  filters: any
}

// Nhãn + màu cho phân loại email.
const CATEGORY_META: Record<string, { label: string; cls: string }> = {
  workshop: { label: "Workshop", cls: "bg-amber-100 text-amber-800" },
  course: { label: "Khoá học", cls: "bg-emerald-100 text-emerald-800" },
  marketing: { label: "Marketing", cls: "bg-blue-100 text-blue-800" },
  notification: { label: "Thông báo", cls: "bg-purple-100 text-purple-800" },
  transactional: { label: "Giao dịch", cls: "bg-gray-200 text-gray-700" },
  manual: { label: "Thủ công", cls: "bg-gray-100 text-gray-700" },
}

export default function EmailHistoryPage() {
  const [rows, setRows] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [detail, setDetail] = useState<Campaign | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/campaigns?status=sent")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch")
      setRows(data.campaigns || [])
    } catch (err) {
      console.error("Error fetching email history:", err)
    } finally {
      setLoading(false)
    }
  }

  const remove = async (r: Campaign) => {
    if (!confirm(`Xoá bản ghi email "${r.name || "này"}" khỏi lịch sử? (không thu hồi được mail đã gửi)`)) return
    try {
      const res = await fetch(`/api/admin/campaigns/${r.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error || "Delete failed")
      setRows((prev) => prev.filter((x) => x.id !== r.id))
      setDetail((d) => (d && d.id === r.id ? null : d))
    } catch (err: any) {
      alert("Lỗi xoá: " + err.message)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => {
      const name = (r.name || "").toLowerCase()
      const subject = (r.subject || "").toLowerCase()
      const by = (r.createdBy || "").toLowerCase()
      return name.includes(q) || subject.includes(q) || by.includes(q)
    })
  }, [rows, search])

  const formatDateTime = (s: string | null) => {
    if (!s) return "—"
    return new Date(s).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    })
  }

  const isScheduled = (r: Campaign) => Boolean(r.filters && r.filters.scheduledAt)

  const CategoryBadge = ({ category }: { category: string | null }) => {
    const m = CATEGORY_META[category || "manual"] || { label: category || "—", cls: "bg-gray-100 text-gray-700" }
    return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${m.cls}`}>{m.label}</span>
  }

  return (
    <AdminAuth>
      <AdminSidebar>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <History className="h-6 w-6 text-[#083121]" /> Lịch sử Email
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Các email đã gửi gần đây — gồm chiến dịch marketing và mail gửi thủ công cho workshop / khoá học.
            </p>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, chủ đề hoặc người gửi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:ring-[#083121] focus:border-[#083121]"
            />
          </div>

          {/* Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Đang tải...</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                {search ? "Không tìm thấy kết quả phù hợp." : "Chưa có email nào được gửi."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chủ đề</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phân loại</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người nhận</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian gửi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người gửi</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filtered.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-[220px] truncate">{r.name || "—"}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-[260px] truncate">{r.subject || "—"}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><CategoryBadge category={r.category} /></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.totalRecipients}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            {formatDateTime(r.sentAt)}
                            {isScheduled(r) && (
                              <span className="inline-flex items-center gap-1 text-amber-700 text-xs">
                                <Clock className="h-3 w-3" /> đã hẹn lịch
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.createdBy || "—"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => setDetail(r)} className="text-[#083121] hover:text-[#4a5c52]" title="Xem chi tiết">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button onClick={() => remove(r)} className="text-red-600 hover:text-red-900" title="Xoá khỏi lịch sử">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Detail modal */}
        {detail && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setDetail(null)}>
            <div className="relative top-10 mx-auto p-0 border w-full max-w-lg shadow-lg rounded-lg bg-white mb-10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#083121] rounded-t-lg">
                <h3 className="text-lg font-medium text-white">Chi tiết email</h3>
                <button onClick={() => setDetail(null)} className="text-white/80 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6 space-y-3 text-sm">
                <Row label="Tên" value={detail.name} />
                <Row label="Chủ đề" value={detail.subject} />
                <Row label="Phân loại" value={CATEGORY_META[detail.category || "manual"]?.label || detail.category} />
                <Row label="Số người nhận" value={String(detail.totalRecipients)} />
                <Row label="Thời gian gửi" value={formatDateTime(detail.sentAt)} />
                <Row label="Người gửi" value={detail.createdBy} />
                {detail.filters?.templateName && <Row label="Mẫu dùng" value={detail.filters.templateName} />}
                {isScheduled(detail) && <Row label="Hẹn lịch lúc" value={formatDateTime(detail.filters.scheduledAt)} />}
              </div>
            </div>
          </div>
        )}
      </AdminSidebar>
    </AdminAuth>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-gray-100">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="text-gray-900 text-right">{value || "—"}</span>
    </div>
  )
}
