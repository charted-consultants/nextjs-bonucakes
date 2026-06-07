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
  Mail,
  Clock,
  Send,
  Loader2,
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

  // Chọn người nhận + gửi mail nhắc workshop
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [sendOpen, setSendOpen] = useState(false)
  const [sendMode, setSendMode] = useState<"now" | "schedule">("now")
  const [scheduleAt, setScheduleAt] = useState("")
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<string | null>(null)

  // Mẫu email workshop (lọc từ DB theo category="workshop")
  const [templates, setTemplates] = useState<{ id: number; displayName: string }[]>([])
  const [templateId, setTemplateId] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/admin/email-templates")
      const data = await res.json()
      if (!res.ok) return
      const list = (data.templates || [])
        .filter((t: any) => t.category === "workshop" && t.active && !t.deletedAt)
        .map((t: any) => ({ id: t.id, displayName: t.displayName }))
      setTemplates(list)
      if (list.length > 0) setTemplateId((prev) => prev ?? list[0].id)
    } catch (err) {
      console.error("Error fetching workshop templates:", err)
    }
  }

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

  // ── Chọn người nhận ──────────────────────────────────────────────
  const toggleOne = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const filteredIds = useMemo(() => filtered.map((r) => r.id), [filtered])
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selected.has(id))

  const toggleAllFiltered = () =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (allFilteredSelected) filteredIds.forEach((id) => next.delete(id))
      else filteredIds.forEach((id) => next.add(id))
      return next
    })

  // Danh sách email duy nhất từ các bản ghi đã chọn (gửi đúng người, không trùng email)
  const selectedRecipients = useMemo(() => {
    const map = new Map<string, { email: string; name: string; customerId: number | null }>()
    for (const r of registrations) {
      if (!selected.has(r.id)) continue
      const email = (r.customer?.email || "").trim().toLowerCase()
      if (!email) continue
      if (!map.has(email))
        map.set(email, {
          email,
          name: r.customer?.name || "",
          customerId: r.customerId ?? r.customer?.id ?? null,
        })
    }
    return Array.from(map.values())
  }, [registrations, selected])

  const openSend = () => {
    setSendResult(null)
    setSendMode("now")
    setScheduleAt("")
    setSendOpen(true)
  }

  const sendReminder = async () => {
    if (selectedRecipients.length === 0) return
    if (!templateId) {
      setSendResult("Vui lòng chọn mẫu email.")
      return
    }
    let scheduledAt: string | null = null
    if (sendMode === "schedule") {
      if (!scheduleAt) {
        setSendResult("Vui lòng chọn thời gian hẹn gửi.")
        return
      }
      // input datetime-local là giờ địa phương trình duyệt → đổi sang ISO (UTC)
      const t = new Date(scheduleAt)
      if (Number.isNaN(t.getTime()) || t.getTime() <= Date.now()) {
        setSendResult("Thời gian hẹn phải ở tương lai.")
        return
      }
      scheduledAt = t.toISOString()
    }
    const tplName = templates.find((t) => t.id === templateId)?.displayName || "Email"
    try {
      setSending(true)
      setSendResult(null)
      const res = await fetch("/api/admin/send-template-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: selectedRecipients,
          templateId,
          scheduledAt,
          sourceLabel: `Workshop — ${tplName}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gửi thất bại")
      const when = data.scheduled ? "đã được hẹn lịch" : "đã gửi"
      let msg = `✅ ${data.sent}/${data.total} email ${when} thành công.`
      if (data.errors?.length) msg += `\n❌ Lỗi: ${data.errors.join("; ")}`
      setSendResult(msg)
      if (data.sent > 0 && !data.errors?.length) {
        setSelected(new Set()) // xong thì bỏ chọn
      }
    } catch (err: any) {
      setSendResult("❌ " + err.message)
    } finally {
      setSending(false)
    }
  }

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
            <div className="flex gap-2">
              <button
                onClick={openSend}
                disabled={selected.size === 0}
                className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-[#083121] hover:bg-[#0a3d29] disabled:opacity-40 disabled:cursor-not-allowed"
                title={selected.size === 0 ? "Tick chọn người nhận trước" : "Gửi email cho người đã chọn"}
              >
                <Mail className="h-4 w-4 mr-2" />
                Gửi email{selected.size > 0 ? ` (${selectedRecipients.length})` : ""}
              </button>
              <button
                onClick={exportCSV}
                disabled={filtered.length === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Xuất CSV
              </button>
            </div>
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
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={allFilteredSelected}
                          onChange={toggleAllFiltered}
                          title="Chọn tất cả (theo bộ lọc hiện tại)"
                          className="h-4 w-4 rounded border-gray-300 text-[#083121] focus:ring-[#083121]"
                        />
                      </th>
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
                      <tr key={r.id} className={`hover:bg-gray-50 ${selected.has(r.id) ? "bg-[#083121]/5" : ""}`}>
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selected.has(r.id)}
                            onChange={() => toggleOne(r.id)}
                            className="h-4 w-4 rounded border-gray-300 text-[#083121] focus:ring-[#083121]"
                          />
                        </td>
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

        {/* Send reminder modal */}
        {sendOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => !sending && setSendOpen(false)}>
            <div
              className="relative top-10 mx-auto p-0 border w-full max-w-lg shadow-lg rounded-lg bg-white mb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#083121] rounded-t-lg">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <Mail className="h-5 w-5" /> Gửi email cho người nhận
                </h3>
                <button onClick={() => !sending && setSendOpen(false)} className="text-white/80 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Gửi tới <strong className="text-[#083121]">{selectedRecipients.length}</strong> người nhận (email duy nhất):
                  </p>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50 text-sm">
                    {selectedRecipients.map((r) => (
                      <div key={r.email} className="py-0.5 text-gray-700">
                        {r.name ? `${r.name} — ` : ""}<span className="text-gray-500">{r.email}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chọn mẫu email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mẫu email gửi</label>
                  {templates.length === 0 ? (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                      Chưa có mẫu email workshop. Vào <strong>Email Templates</strong> để tạo (phân loại "workshop").
                    </p>
                  ) : (
                    <select
                      value={templateId ?? ""}
                      onChange={(e) => setTemplateId(Number(e.target.value))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-[#083121] focus:border-[#083121] text-sm"
                    >
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>{t.displayName}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Chọn gửi ngay / hẹn giờ */}
                <div className="space-y-2">
                  <label className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer ${sendMode === "now" ? "border-[#083121] bg-[#083121]/5" : "border-gray-200"}`}>
                    <input type="radio" name="sendMode" checked={sendMode === "now"} onChange={() => setSendMode("now")} className="text-[#083121] focus:ring-[#083121]" />
                    <Send className="h-4 w-4 text-[#083121]" />
                    <span className="text-sm font-medium text-gray-800">Gửi ngay bây giờ</span>
                  </label>
                  <label className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer ${sendMode === "schedule" ? "border-[#083121] bg-[#083121]/5" : "border-gray-200"}`}>
                    <input type="radio" name="sendMode" checked={sendMode === "schedule"} onChange={() => setSendMode("schedule")} className="text-[#083121] focus:ring-[#083121]" />
                    <Clock className="h-4 w-4 text-[#083121]" />
                    <span className="text-sm font-medium text-gray-800">Hẹn giờ gửi</span>
                  </label>
                  {sendMode === "schedule" && (
                    <div className="pl-3">
                      <input
                        type="datetime-local"
                        value={scheduleAt}
                        onChange={(e) => setScheduleAt(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:ring-[#083121] focus:border-[#083121] text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">Theo giờ máy của bạn. Resend hỗ trợ hẹn tối đa 72 giờ.</p>
                    </div>
                  )}
                </div>

                {sendResult && (
                  <div className="text-sm whitespace-pre-wrap rounded-md bg-gray-50 border border-gray-200 p-3 text-gray-800">
                    {sendResult}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <button
                  onClick={() => setSendOpen(false)}
                  disabled={sending}
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Đóng
                </button>
                <button
                  onClick={sendReminder}
                  disabled={sending || selectedRecipients.length === 0 || !templateId}
                  className="inline-flex items-center px-5 py-2 rounded-md text-sm font-medium text-white bg-[#083121] hover:bg-[#0a3d29] disabled:opacity-50"
                >
                  {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  {sending ? "Đang gửi..." : sendMode === "schedule" ? "Đặt lịch gửi" : "Gửi ngay"}
                </button>
              </div>
            </div>
          </div>
        )}

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
