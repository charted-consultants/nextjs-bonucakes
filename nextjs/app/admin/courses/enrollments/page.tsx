"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminAuth from "@/components/admin/AdminAuth"
import { Search, Download, Trash2, Eye, X, ArrowLeft, BookOpen, Mail, Send, Clock, Loader2 } from "lucide-react"
import type { AdminCourseEnrollment as Enrollment } from "@/lib/registration-types"

const STATUS_OPTIONS = [
  { value: "new", label: "Mới", cls: "bg-blue-100 text-blue-800" },
  { value: "contacted", label: "Đã liên hệ", cls: "bg-amber-100 text-amber-800" },
  { value: "enrolled", label: "Đã ghi danh", cls: "bg-green-100 text-green-800" },
  { value: "declined", label: "Từ chối", cls: "bg-gray-200 text-gray-700" },
]

export default function CourseEnrollmentsPage() {
  const [rows, setRows] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [detail, setDetail] = useState<Enrollment | null>(null)

  // Chọn người nhận + gửi email theo template
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [sendOpen, setSendOpen] = useState(false)
  const [sendMode, setSendMode] = useState<"now" | "schedule">("now")
  const [scheduleAt, setScheduleAt] = useState("")
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<string | null>(null)
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
        .filter((t: any) => t.category === "course" && t.active && !t.deletedAt)
        .map((t: any) => ({ id: t.id, displayName: t.displayName }))
      setTemplates(list)
      if (list.length > 0) setTemplateId((prev) => prev ?? list[0].id)
    } catch (err) {
      console.error("Error fetching course templates:", err)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/course-enrollments")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch")
      setRows(data.enrollments || [])
    } catch (err) {
      console.error("Error fetching course enrollments:", err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => {
      const name = (r.name || r.customer?.name || "").toLowerCase()
      const email = (r.email || r.customer?.email || "").toLowerCase()
      const phone = (r.phone || r.customer?.phone || "").toLowerCase()
      return name.includes(q) || email.includes(q) || phone.includes(q)
    })
  }, [rows, search])

  const counts = useMemo(() => {
    const c: Record<string, number> = { new: 0, contacted: 0, enrolled: 0, declined: 0 }
    rows.forEach((r) => { c[r.status] = (c[r.status] || 0) + 1 })
    return c
  }, [rows])

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

  // Email duy nhất từ các bản ghi đã chọn (kèm customerId để log người nhận).
  const selectedRecipients = useMemo(() => {
    const map = new Map<string, { email: string; name: string; customerId: number | null }>()
    for (const r of rows) {
      if (!selected.has(r.id)) continue
      const email = (r.email || r.customer?.email || "").trim().toLowerCase()
      if (!email) continue
      if (!map.has(email))
        map.set(email, {
          email,
          name: r.name || r.customer?.name || "",
          customerId: r.customerId ?? r.customer?.id ?? null,
        })
    }
    return Array.from(map.values())
  }, [rows, selected])

  const openSend = () => {
    setSendResult(null)
    setSendMode("now")
    setScheduleAt("")
    setSendOpen(true)
  }

  const sendEmail = async () => {
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
          sourceLabel: `Khoá học — ${tplName}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gửi thất bại")
      const when = data.scheduled ? "đã được hẹn lịch" : "đã gửi"
      let msg = `✅ ${data.sent}/${data.total} email ${when} thành công.`
      if (data.errors?.length) msg += `\n❌ Lỗi: ${data.errors.join("; ")}`
      setSendResult(msg)
      if (data.sent > 0 && !data.errors?.length) setSelected(new Set())
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
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    })
  }

  const updateStatus = async (r: Enrollment, status: string) => {
    try {
      const res = await fetch(`/api/admin/course-enrollments/${r.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Update failed")
      setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status } : x)))
      setDetail((d) => (d && d.id === r.id ? { ...d, status } : d))
    } catch (err: any) {
      alert("Lỗi cập nhật: " + err.message)
    }
  }

  const remove = async (r: Enrollment) => {
    if (!confirm(`Xoá lead "${r.name || "khách"}"? (xoá mềm, có thể khôi phục trong DB)`)) return
    try {
      const res = await fetch(`/api/admin/course-enrollments/${r.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error || "Delete failed")
      setRows((prev) => prev.filter((x) => x.id !== r.id))
      setDetail((d) => (d && d.id === r.id ? null : d))
    } catch (err: any) {
      alert("Lỗi xoá: " + err.message)
    }
  }

  const csvCell = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v)
    return `"${s.replace(/"/g, '""')}"`
  }

  // CSV chỉ chứa data khách của khoá học — sạch, không lẫn workshop khác.
  const exportCSV = () => {
    const header = ["Tên", "Email", "SĐT", "Khu vực", "Hình thức học", "Mục tiêu", "Khoá học", "Trạng thái", "Ngày đăng ký"]
    const statusLabel = (s: string) => STATUS_OPTIONS.find((o) => o.value === s)?.label || s
    const data = filtered.map((r) => [
      r.name || r.customer?.name || "",
      r.email || r.customer?.email || "",
      r.phone || r.customer?.phone || "",
      r.location || "",
      r.format || "",
      r.goal || "",
      r.courseName || "",
      statusLabel(r.status),
      formatDateTime(r.registrationDate),
    ])
    const csv = "﻿" + [header, ...data].map((row) => row.map(csvCell).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dang-ky-khoa-hoc-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const o = STATUS_OPTIONS.find((x) => x.value === status)
    return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${o?.cls || "bg-gray-100 text-gray-700"}`}>{o?.label || status}</span>
  }

  return (
    <AdminAuth>
      <AdminSidebar>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <Link href="/admin/courses" className="inline-flex items-center text-sm text-gray-500 hover:text-[#083121] mb-2">
              <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại danh sách khoá học
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-[#083121]" /> Đăng ký khoá học
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Lead đổ về từ form trang khoá học — lưu ở bảng riêng <span className="font-mono">course_enrollments</span>. Xuất CSV ở đây chỉ gồm data khách của khoá học.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATUS_OPTIONS.map((o) => (
              <div key={o.value} className="bg-white shadow rounded-lg p-4">
                <div className="text-sm text-gray-500">{o.label}</div>
                <div className="text-2xl font-semibold text-gray-900">{loading ? "..." : counts[o.value] || 0}</div>
              </div>
            ))}
          </div>

          {/* Search + export */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, email hoặc SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:ring-[#083121] focus:border-[#083121]"
              />
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
                <Download className="h-4 w-4 mr-2" /> Xuất CSV ({filtered.length})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Đang tải...</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                {search ? "Không tìm thấy kết quả phù hợp." : "Chưa có đăng ký khoá học nào."}
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
                          className="rounded border-gray-300 text-[#083121] focus:ring-[#083121]"
                          title="Chọn tất cả"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liên hệ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khu vực</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình thức</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày ĐK</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filtered.map((r) => (
                      <tr key={r.id} className={`hover:bg-gray-50 ${selected.has(r.id) ? "bg-[#083121]/5" : ""}`}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selected.has(r.id)}
                            onChange={() => toggleOne(r.id)}
                            className="rounded border-gray-300 text-[#083121] focus:ring-[#083121]"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{r.name || r.customer?.name || "—"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{r.email || r.customer?.email || "—"}</div>
                          {(r.phone || r.customer?.phone) && <div className="text-sm text-gray-500">{r.phone || r.customer?.phone}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.location || "—"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.format || "—"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(r.registrationDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={r.status}
                            onChange={(e) => updateStatus(r, e.target.value)}
                            className="text-xs rounded-md border-gray-300 shadow-sm focus:ring-[#083121] focus:border-[#083121] py-1"
                          >
                            {STATUS_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </td>
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

        {/* Send email modal */}
        {sendOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => !sending && setSendOpen(false)}>
            <div className="relative top-10 mx-auto p-0 border w-full max-w-lg shadow-lg rounded-lg bg-white mb-10" onClick={(e) => e.stopPropagation()}>
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
                      Chưa có mẫu email khoá học. Vào <strong>Email Templates</strong> để tạo (phân loại "course").
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

                {/* Gửi ngay / hẹn giờ */}
                <div className="space-y-2">
                  <label className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer ${sendMode === "now" ? "border-[#083121] bg-[#083121]/5" : "border-gray-200"}`}>
                    <input type="radio" name="sendModeCourse" checked={sendMode === "now"} onChange={() => setSendMode("now")} className="text-[#083121] focus:ring-[#083121]" />
                    <Send className="h-4 w-4 text-[#083121]" />
                    <span className="text-sm font-medium text-gray-800">Gửi ngay bây giờ</span>
                  </label>
                  <label className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer ${sendMode === "schedule" ? "border-[#083121] bg-[#083121]/5" : "border-gray-200"}`}>
                    <input type="radio" name="sendModeCourse" checked={sendMode === "schedule"} onChange={() => setSendMode("schedule")} className="text-[#083121] focus:ring-[#083121]" />
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
                  onClick={sendEmail}
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
            <div className="relative top-10 mx-auto p-0 border w-full max-w-2xl shadow-lg rounded-lg bg-white mb-10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#083121] rounded-t-lg">
                <h3 className="text-lg font-medium text-white">Chi tiết đăng ký khoá học</h3>
                <button onClick={() => setDetail(null)} className="text-white/80 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6 space-y-1">
                <DetailRow label="Họ tên" value={detail.name || detail.customer?.name} />
                <DetailRow label="Email" value={detail.email || detail.customer?.email} />
                <DetailRow label="Điện thoại" value={detail.phone || detail.customer?.phone} />
                <DetailRow label="Khu vực" value={detail.location} />
                <DetailRow label="Hình thức học" value={detail.format} highlight />
                <DetailRow label="Mục tiêu" value={detail.goal} block />
                <DetailRow label="Khoá học" value={detail.courseName} />
                <div className="py-2 border-b border-gray-100 flex justify-between gap-4 items-center">
                  <span className="text-sm font-medium text-gray-500">Trạng thái</span>
                  <select
                    value={detail.status}
                    onChange={(e) => updateStatus(detail, e.target.value)}
                    className="text-sm rounded-md border-gray-300 shadow-sm focus:ring-[#083121] focus:border-[#083121] py-1"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <DetailRow label="Ngày đăng ký" value={formatDateTime(detail.registrationDate)} />
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <StatusBadge status={detail.status} />
                <div className="flex gap-3">
                  {(detail.email || detail.customer?.email) && (
                    <a href={`mailto:${detail.email || detail.customer?.email}`} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      Gửi email
                    </a>
                  )}
                  <button onClick={() => remove(detail)} className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                    <Trash2 className="h-4 w-4 mr-2" /> Xoá
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

function DetailRow({ label, value, block, highlight }: { label: string; value?: string | null; block?: boolean; highlight?: boolean }) {
  if (!value) return null
  return (
    <div className={`py-2 border-b border-gray-100 ${block ? "" : "flex justify-between gap-4"}`}>
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className={`text-sm ${block ? "block mt-1 whitespace-pre-wrap" : "text-right"} ${highlight ? "font-semibold text-[#083121]" : "text-gray-900"}`}>
        {value}
      </span>
    </div>
  )
}
