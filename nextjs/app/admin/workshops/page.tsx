"use client"

import { useState, useEffect, useMemo } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminAuth from "@/components/admin/AdminAuth"
import {
  GraduationCap,
  CalendarClock,
  Search,
  Download,
  Check,
  X,
  Trash2,
  Eye,
  CheckCircle,
} from "lucide-react"
import {
  WORKSHOP_NAME_BOOKING_1ON1 as BOOKING_NAME,
  WORKSHOP_NAME_PREORDER_BLTM as PREORDER_NAME,
  type AdminCustomer as Customer,
  type AdminRegistration as Registration,
} from "@/lib/registration-types"

// "Workshop tab" = mọi bản ghi KHÔNG phải booking 1-1 và KHÔNG phải Pre-Order BLTM
// (gồm "Workshop Bếp Bà Bo", "Triển khai và thiết lập mục tiêu", và các workshop khác sau này).
// Tên workshop import từ @/lib/registration-types để đồng bộ với 3 route POST tương ứng.

type Tab = "workshop" | "booking"

export default function WorkshopsAdminPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("workshop")
  const [search, setSearch] = useState("")
  const [detail, setDetail] = useState<Registration | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/workshops?limit=500")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch")
      // Loại bỏ bản ghi đã xoá mềm và đơn Pre-Order BLTM (chỉ giữ workshop + tư vấn 1-1)
      const rows: Registration[] = (data.registrations || []).filter(
        (r: Registration) => !r.deletedAt && r.workshopName !== PREORDER_NAME
      )
      setRegistrations(rows)
    } catch (err) {
      console.error("Error fetching workshop registrations:", err)
    } finally {
      setLoading(false)
    }
  }

  const workshops = useMemo(
    () => registrations.filter((r) => r.workshopName !== BOOKING_NAME),
    [registrations]
  )
  const bookings = useMemo(
    () => registrations.filter((r) => r.workshopName === BOOKING_NAME),
    [registrations]
  )

  const list = tab === "workshop" ? workshops : bookings

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter((r) => {
      const name = (r.customer?.name || "").toLowerCase()
      const email = (r.customer?.email || "").toLowerCase()
      const phone = (r.phone || r.customer?.phone || "").toLowerCase()
      return name.includes(q) || email.includes(q) || phone.includes(q)
    })
  }, [list, search])

  const attendedCount = workshops.filter((r) => r.attended).length

  const formatDateTime = (s: string | null) => {
    if (!s) return "—"
    return new Date(s).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toggleAttended = async (r: Registration) => {
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
      // Cập nhật cục bộ để phản hồi tức thì
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
    if (!confirm(`Xoá bản ghi của "${r.customer?.name || "khách"}"? (xoá mềm, có thể khôi phục trong DB)`)) return
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
    let header: string[]
    let rows: string[][]
    if (tab === "workshop") {
      header = [
        "Tên", "Email", "SĐT", "Độ tuổi", "Khu vực", "Giai đoạn F&B",
        "Động lực", "Điều ngăn cản", "Câu hỏi", "Nguồn biết đến",
        "Ghi chú thêm", "Đã tham gia", "Ngày đăng ký",
      ]
      rows = filtered.map((r) => [
        r.customer?.name || "",
        r.customer?.email || "",
        r.phone || r.customer?.phone || "",
        r.age || "",
        r.location || "",
        r.fbExperience || "",
        r.goals || "",
        (r.barriers || []).join("; "),
        r.specificQuestions || "",
        r.referralSource || "",
        r.otherNotes || "",
        r.attended ? "Có" : "Chưa",
        formatDateTime(r.registrationDate),
      ])
    } else {
      header = ["Tên", "Email", "SĐT", "Khung giờ", "Thông tin kinh doanh", "Nhu cầu / câu hỏi", "Đã tư vấn", "Ngày đặt"]
      rows = filtered.map((r) => [
        r.customer?.name || "",
        r.customer?.email || "",
        r.phone || r.customer?.phone || "",
        r.availability || "",
        r.otherNotes || "",
        r.specificQuestions || "",
        r.attended ? "Có" : "Chưa",
        formatDateTime(r.registrationDate),
      ])
    }
    const csv = "﻿" + [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${tab === "workshop" ? "workshop-dang-ky" : "tu-van-1-1"}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => (
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

  const TabButton = ({ value, label, count }: { value: Tab; label: string; count: number }) => (
    <button
      onClick={() => { setTab(value); setSearch("") }}
      className={`px-4 py-2 text-sm font-medium rounded-md transition ${
        tab === value
          ? "bg-[#083121] text-white"
          : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
      }`}
    >
      {label} ({count})
    </button>
  )

  const AttendedBadge = ({ r }: { r: Registration }) => (
    <button
      onClick={() => toggleAttended(r)}
      title="Bấm để đổi trạng thái"
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition ${
        r.attended
          ? "bg-green-100 text-green-800 hover:bg-green-200"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {r.attended ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
      {tab === "workshop" ? (r.attended ? "Đã tham gia" : "Chưa tham gia") : (r.attended ? "Đã tư vấn" : "Chưa tư vấn")}
    </button>
  )

  return (
    <AdminAuth>
      <AdminSidebar>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workshop &amp; Tư vấn 1-1</h1>
            <p className="mt-1 text-sm text-gray-500">
              Danh sách khách đăng ký từ trang <span className="font-mono">/workshop_booking1-1</span> — đổ về tự động qua form.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <StatCard icon={<GraduationCap className="h-6 w-6" />} label="Đăng ký Workshop" value={workshops.length} color="text-[#083121]" />
            <StatCard icon={<CalendarClock className="h-6 w-6" />} label="Booking Tư vấn 1-1" value={bookings.length} color="text-[#fcc56c]" />
            <StatCard icon={<CheckCircle className="h-6 w-6" />} label="Đã tham gia Workshop" value={attendedCount} color="text-green-600" />
          </div>

          {/* Tabs + search + export */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <TabButton value="workshop" label="Đăng ký Workshop" count={workshops.length} />
              <TabButton value="booking" label="Tư vấn 1-1" count={bookings.length} />
            </div>
            <button
              onClick={exportCSV}
              disabled={filtered.length === 0}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Xuất CSV
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, email hoặc số điện thoại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:ring-[#083121] focus:border-[#083121]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Đang tải...</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                {search ? "Không tìm thấy kết quả phù hợp." : "Chưa có đăng ký nào."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liên hệ</th>
                      {tab === "workshop" ? (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workshop</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khu vực</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giai đoạn F&amp;B</th>
                        </>
                      ) : (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khung giờ</th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng ký</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filtered.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{r.customer?.name || "—"}</div>
                          {r.age && <div className="text-xs text-gray-500">{r.age}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{r.customer?.email || "—"}</div>
                          {(r.phone || r.customer?.phone) && (
                            <div className="text-sm text-gray-500">{r.phone || r.customer?.phone}</div>
                          )}
                        </td>
                        {tab === "workshop" ? (
                          <>
                            <td className="px-6 py-4 text-sm text-gray-700 max-w-[220px]">{r.workshopName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.location || "—"}</td>
                            <td className="px-6 py-4 text-sm text-gray-700 max-w-[200px] truncate" title={r.fbExperience || ""}>{r.fbExperience || "—"}</td>
                          </>
                        ) : (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#083121]">{r.availability || "—"}</td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(r.registrationDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><AttendedBadge r={r} /></td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => setDetail(r)} className="text-[#083121] hover:text-[#4a5c52]" title="Xem chi tiết">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button onClick={() => remove(r)} className="text-red-600 hover:text-red-900" title="Xoá">
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
            <div
              className="relative top-10 mx-auto p-0 border w-full max-w-2xl shadow-lg rounded-lg bg-white mb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#083121] rounded-t-lg">
                <h3 className="text-lg font-medium text-white">
                  {detail.workshopName === BOOKING_NAME ? "Chi tiết đặt lịch tư vấn 1-1" : "Chi tiết đăng ký workshop"}
                </h3>
                <button onClick={() => setDetail(null)} className="text-white/80 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-1">
                <DetailRow label="Họ tên" value={detail.customer?.name} />
                <DetailRow label="Email" value={detail.customer?.email} />
                <DetailRow label="Điện thoại" value={detail.phone || detail.customer?.phone} />

                {detail.workshopName === BOOKING_NAME ? (
                  <>
                    <DetailRow label="Khung giờ chọn" value={detail.availability} highlight />
                    <DetailRow label="Thông tin kinh doanh" value={detail.otherNotes} block />
                    <DetailRow label="Nhu cầu / câu hỏi" value={detail.specificQuestions} block />
                  </>
                ) : (
                  <>
                    <DetailRow label="Workshop" value={detail.workshopName} highlight />
                    <DetailRow label="Độ tuổi / năm sinh" value={detail.age} />
                    <DetailRow label="Khu vực" value={detail.location} />
                    <DetailRow label="Giai đoạn F&B" value={detail.fbExperience} />
                    <DetailRow label="Động lực kinh doanh" value={detail.goals} block />
                    <DetailRow label="Điều đang ngăn cản" value={(detail.barriers || []).join(", ")} block />
                    <DetailRow label="Ghi chú thêm" value={detail.otherNotes} block />
                    <DetailRow label="Câu hỏi / chia sẻ" value={detail.specificQuestions} block />
                    <DetailRow label="Biết đến qua" value={detail.referralSource} />
                    {detail.facebookLink && <DetailRow label="Facebook" value={detail.facebookLink} />}
                  </>
                )}

                <DetailRow label="Ngày đăng ký" value={formatDateTime(detail.registrationDate)} />
                {detail.attendanceDate && <DetailRow label="Ngày tham gia" value={formatDateTime(detail.attendanceDate)} />}
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <button
                  onClick={() => toggleAttended(detail)}
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                    detail.attended
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {detail.attended
                    ? (detail.workshopName === BOOKING_NAME ? "Bỏ đánh dấu đã tư vấn" : "Bỏ đánh dấu đã tham gia")
                    : (detail.workshopName === BOOKING_NAME ? "Đánh dấu đã tư vấn" : "Đánh dấu đã tham gia")}
                </button>
                <div className="flex gap-3">
                  {detail.customer?.email && (
                    <a
                      href={`mailto:${detail.customer.email}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Gửi email
                    </a>
                  )}
                  <button
                    onClick={() => remove(detail)}
                    className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xoá
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminSidebar>
    </AdminAuth>
  )
}

function DetailRow({
  label,
  value,
  block,
  highlight,
}: {
  label: string
  value?: string | null
  block?: boolean
  highlight?: boolean
}) {
  if (!value) return null
  return (
    <div className={`py-2 border-b border-gray-100 ${block ? "" : "flex justify-between gap-4"}`}>
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span
        className={`text-sm ${block ? "block mt-1 whitespace-pre-wrap" : "text-right"} ${
          highlight ? "font-semibold text-[#083121]" : "text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  )
}
