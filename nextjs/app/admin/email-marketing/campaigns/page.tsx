"use client"

import { useState, useEffect, useRef } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminAuth from "@/components/admin/AdminAuth"
import { Mail, Send, Users, Filter, Eye, X, Save, Edit, Trash2, FilePlus } from "lucide-react"

interface DraftCampaign {
  id: number
  name: string
  subject: string | null
  filters: any
  createdAt: string
}

interface EmailTemplate {
  id: number
  name: string
  displayName: string
  subject: string
  htmlContent: string
  variables: string[]
  active: boolean
  category: string | null
}

interface Customer {
  id: number
  name: string
  email: string
  tags: string[]
  location?: string
}

export default function EmailCampaignsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Filter states
  const [filters, setFilters] = useState({
    tags: [] as string[],
    location: "",
    hasOrders: null as boolean | null,
    marketingConsent: true,
  })

  const [matchedCustomers, setMatchedCustomers] = useState<Customer[]>([])
  const [recipientCount, setRecipientCount] = useState(0)

  // Campaign details
  const [campaignName, setCampaignName] = useState("")
  const [customSubject, setCustomSubject] = useState("")

  // Test mode
  const [testMode, setTestMode] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [showRecipientList, setShowRecipientList] = useState(false)

  // Available filter options
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [availableLocations, setAvailableLocations] = useState<string[]>([])

  // Chiến dịch nháp
  const [drafts, setDrafts] = useState<DraftCampaign[]>([])
  const [editingDraftId, setEditingDraftId] = useState<number | null>(null)
  const [savingDraft, setSavingDraft] = useState(false)
  // Bỏ qua 1 lần auto-fill subject khi nạp nháp (giữ subject riêng của nháp)
  const skipSubjectSync = useRef(false)

  useEffect(() => {
    fetchTemplates()
    fetchFilterOptions()
    fetchDrafts()
  }, [])

  useEffect(() => {
    if (selectedTemplate) {
      if (skipSubjectSync.current) {
        skipSubjectSync.current = false
        return
      }
      setCustomSubject(selectedTemplate.subject)
    }
  }, [selectedTemplate])

  const fetchDrafts = async () => {
    try {
      const res = await fetch("/api/admin/campaigns?status=draft")
      const data = await res.json()
      if (res.ok) setDrafts(data.campaigns || [])
    } catch (err) {
      console.error("Error fetching drafts:", err)
    }
  }

  const saveDraft = async () => {
    if (!selectedTemplate) { alert("Vui lòng chọn mẫu email"); return }
    if (!campaignName) { alert("Vui lòng nhập tên chiến dịch"); return }
    try {
      setSavingDraft(true)
      const payload = {
        name: campaignName,
        templateId: selectedTemplate.id,
        subject: customSubject || selectedTemplate.subject,
        filters,
      }
      const url = editingDraftId ? `/api/admin/campaigns/${editingDraftId}` : "/api/admin/campaigns"
      const method = editingDraftId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Lưu nháp thất bại")
      if (!editingDraftId && data.campaign?.id) setEditingDraftId(data.campaign.id)
      await fetchDrafts()
      alert("Đã lưu nháp")
    } catch (err: any) {
      alert("Lỗi lưu nháp: " + err.message)
    } finally {
      setSavingDraft(false)
    }
  }

  const loadDraft = (d: DraftCampaign) => {
    const f = d.filters || {}
    const tpl = templates.find((t) => t.id === f.templateId) || null
    skipSubjectSync.current = !!tpl
    setSelectedTemplate(tpl)
    setCampaignName(d.name)
    setCustomSubject(d.subject || (tpl ? tpl.subject : ""))
    setFilters({
      tags: f.tags || [],
      location: f.location || "",
      hasOrders: f.hasOrders ?? null,
      marketingConsent: f.marketingConsent ?? true,
    })
    setEditingDraftId(d.id)
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const deleteDraft = async (id: number) => {
    if (!confirm("Xoá bản nháp này?")) return
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error || "Delete failed")
      if (editingDraftId === id) newCampaign()
      await fetchDrafts()
    } catch (err: any) {
      alert("Lỗi xoá nháp: " + err.message)
    }
  }

  const newCampaign = () => {
    setEditingDraftId(null)
    setSelectedTemplate(null)
    setCampaignName("")
    setCustomSubject("")
    setFilters({ tags: [], location: "", hasOrders: null, marketingConsent: true })
    setMatchedCustomers([])
    setRecipientCount(0)
  }

  useEffect(() => {
    // Auto-update recipient count when filters change
    if (filters.tags.length > 0 || filters.location || filters.hasOrders !== null) {
      fetchMatchedCustomers()
    }
  }, [filters])

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/admin/email-templates")
      const data = await res.json()
      if (res.ok) {
        // Only show active marketing templates
        const marketingTemplates = data.templates.filter(
          (t: EmailTemplate) => t.active
        )
        setTemplates(marketingTemplates)
      }
    } catch (err) {
      console.error("Error fetching templates:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchFilterOptions = async () => {
    try {
      const res = await fetch("/api/admin/customers")
      const data = await res.json()

      if (res.ok) {
        // Extract unique tags
        const tags = new Set<string>()
        const locations = new Set<string>()

        data.customers.forEach((customer: any) => {
          customer.tags?.forEach((tag: string) => tags.add(tag))
          if (customer.location) locations.add(customer.location)
        })

        setAvailableTags(Array.from(tags).sort())
        setAvailableLocations(Array.from(locations).sort())
      }
    } catch (err) {
      console.error("Error fetching filter options:", err)
    }
  }

  const fetchMatchedCustomers = async () => {
    try {
      const params = new URLSearchParams()

      if (filters.tags.length > 0) {
        params.append("tags", filters.tags.join(","))
      }
      if (filters.location) {
        params.append("location", filters.location)
      }
      if (filters.marketingConsent) {
        params.append("marketingConsent", "true")
      }
      if (filters.hasOrders !== null) {
        params.append("hasOrders", filters.hasOrders.toString())
      }

      const res = await fetch(`/api/admin/customers/filter?${params}`)
      const data = await res.json()

      if (res.ok) {
        setMatchedCustomers(data.customers)
        setRecipientCount(data.customers.length)
      }
    } catch (err) {
      console.error("Error fetching matched customers:", err)
    }
  }

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const sendCampaign = async () => {
    if (!selectedTemplate) {
      alert("Please select an email template")
      return
    }

    if (!campaignName) {
      alert("Please enter a campaign name")
      return
    }

    if (testMode) {
      if (!testEmail) {
        alert("Please enter a test email address")
        return
      }
      if (!confirm(`Send test email to ${testEmail}?`)) {
        return
      }
    } else {
      if (recipientCount === 0) {
        alert("No recipients match your filters")
        return
      }
      if (!confirm(`Send campaign to ${recipientCount} recipients?\n\nEmails will be sent in batches to respect rate limits. This may take a few minutes.`)) {
        return
      }
    }

    try {
      setSending(true)

      const res = await fetch("/api/admin/campaigns/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignName,
          templateId: selectedTemplate.id,
          subject: customSubject || selectedTemplate.subject,
          filters,
          customerIds: matchedCustomers.map(c => c.id),
          testMode,
          testEmail: testMode ? testEmail : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to send campaign")

      if (testMode) {
        alert(`Test email sent successfully to ${testEmail}!`)
      } else {
        alert(`Campaign sent successfully!\nSent: ${data.sent}\nFailed: ${data.failed || 0}\nTotal: ${data.total}`)
      }

      // Gửi thật từ 1 nháp → xoá nháp (route send đã tạo bản ghi "đã gửi"), tránh trùng
      if (!testMode && editingDraftId) {
        try {
          await fetch(`/api/admin/campaigns/${editingDraftId}`, { method: "DELETE" })
        } catch (e) {
          console.error("Không xoá được nháp sau khi gửi:", e)
        }
        setEditingDraftId(null)
        fetchDrafts()
      }

      // Reset form
      setSelectedTemplate(null)
      setCampaignName("")
      setCustomSubject("")
      setFilters({
        tags: [],
        location: "",
        hasOrders: null,
        marketingConsent: true,
      })
      setMatchedCustomers([])
      setRecipientCount(0)

    } catch (err: any) {
      alert("Error sending campaign: " + err.message)
    } finally {
      setSending(false)
    }
  }

  const getPreviewHtml = () => {
    if (!selectedTemplate) return ""

    // Replace placeholders with sample data
    return selectedTemplate.htmlContent
      .replace(/{name}/g, "Sample Customer")
      .replace(/{email}/g, "customer@example.com")
      .replace(/{content}/g, "This is a preview of your campaign email.")
  }

  return (
    <AdminAuth>
      <AdminSidebar>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Email Campaigns</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and send email campaigns to filtered customer groups
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Template Selection & Filters */}
            <div className="lg:col-span-2 space-y-6">
              {/* Campaign Name */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Campaign Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Campaign Name *
                    </label>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="March 2026 Workshop Reminder"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-[#fcc56c] focus:border-[#fcc56c]"
                    />
                  </div>
                </div>
              </div>

              {/* Template Selection */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Select Template</h2>
                {loading ? (
                  <p className="text-gray-500">Loading templates...</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`p-4 border-2 rounded-lg text-left transition-colors ${
                          selectedTemplate?.id === template.id
                            ? "border-[#fcc56c] bg-[#fcc56c]/10"
                            : "border-gray-200 hover:border-[#fcc56c]/60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{template.displayName}</h3>
                            <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Variables: {template.variables.map(v => `{${v}}`).join(", ")}
                            </p>
                          </div>
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Subject Line Override */}
              {selectedTemplate && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Email Subject</h2>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Email subject line"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-[#fcc56c] focus:border-[#fcc56c]"
                  />
                </div>
              )}

              {/* Customer Filters */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Filter Recipients</h2>
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>

                <div className="space-y-4">
                  {/* Tags Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            filters.tags.includes(tag)
                              ? "bg-[#fcc56c]/20 text-[#083121] border-2 border-[#fcc56c]"
                              : "bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <select
                      value={filters.location}
                      onChange={(e) => setFilters({...filters, location: e.target.value})}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-[#fcc56c] focus:border-[#fcc56c]"
                    >
                      <option value="">All Locations</option>
                      {availableLocations.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  {/* Has Orders Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order History
                    </label>
                    <select
                      value={filters.hasOrders === null ? "" : filters.hasOrders.toString()}
                      onChange={(e) => setFilters({
                        ...filters,
                        hasOrders: e.target.value === "" ? null : e.target.value === "true"
                      })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-[#fcc56c] focus:border-[#fcc56c]"
                    >
                      <option value="">All Customers</option>
                      <option value="true">Has Orders</option>
                      <option value="false">No Orders</option>
                    </select>
                  </div>

                  {/* Marketing Consent */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.marketingConsent}
                      onChange={(e) => setFilters({...filters, marketingConsent: e.target.checked})}
                      className="h-4 w-4 text-[#083121] focus:ring-[#fcc56c] border-gray-300 rounded accent-[#083121]"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Only customers who consented to marketing
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Recipients & Actions */}
            <div className="space-y-6">
              {/* Recipient Count */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Recipients</h3>
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{recipientCount}</p>
                <p className="text-sm text-gray-500 mt-1">customers will receive this email</p>

                {recipientCount > 0 && (
                  <button
                    onClick={() => setShowRecipientList(!showRecipientList)}
                    className="mt-3 text-sm text-[#083121] hover:text-[#083121]/80 font-medium"
                  >
                    {showRecipientList ? "Hide" : "Show"} recipient list
                  </button>
                )}
              </div>

              {/* Test Mode */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    checked={testMode}
                    onChange={(e) => setTestMode(e.target.checked)}
                    className="h-4 w-4 text-[#083121] focus:ring-[#fcc56c] border-gray-300 rounded accent-[#083121]"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    Test Mode
                  </label>
                </div>
                {testMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Test Email Address
                    </label>
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-[#fcc56c] focus:border-[#fcc56c]"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Test mode will send only to this email address
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="bg-white shadow rounded-lg p-6 space-y-3">
                <button
                  onClick={() => setShowPreview(true)}
                  disabled={!selectedTemplate}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Email
                </button>

                <button
                  onClick={sendCampaign}
                  disabled={!selectedTemplate || !campaignName || (!testMode && recipientCount === 0) || (testMode && !testEmail) || sending}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#083121] hover:bg-[#083121]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? "Sending..." : testMode ? "Send Test Email" : "Send Campaign"}
                </button>

                <button
                  onClick={saveDraft}
                  disabled={!selectedTemplate || !campaignName || savingDraft}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {savingDraft ? "Đang lưu..." : editingDraftId ? "Cập nhật nháp" : "Lưu nháp"}
                </button>

                {editingDraftId && (
                  <button
                    onClick={newCampaign}
                    className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    <FilePlus className="h-4 w-4 mr-2" />
                    Soạn mới (bỏ nháp đang sửa)
                  </button>
                )}
              </div>

              {/* Selected Filters Summary */}
              {(filters.tags.length > 0 || filters.location) && (
                <div className="bg-[#fcc56c]/10 border border-[#fcc56c] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[#083121] mb-2">Active Filters:</h4>
                  <div className="space-y-1">
                    {filters.tags.length > 0 && (
                      <p className="text-sm text-[#083121]/80">
                        Tags: {filters.tags.join(", ")}
                      </p>
                    )}
                    {filters.location && (
                      <p className="text-sm text-[#083121]/80">
                        Location: {filters.location}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bản nháp */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Chiến dịch nháp ({drafts.length})
            </h2>
            {drafts.length === 0 ? (
              <p className="text-sm text-gray-500">
                Chưa có nháp nào. Soạn chiến dịch rồi bấm "Lưu nháp" để lưu lại, sửa hoặc gửi sau.
              </p>
            ) : (
              <div className="divide-y divide-gray-200">
                {drafts.map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {d.name}
                        {editingDraftId === d.id && (
                          <span className="ml-2 text-xs font-medium text-[#083121] bg-[#fcc56c]/30 px-2 py-0.5 rounded-full">
                            đang sửa
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 truncate">{d.subject || "—"}</div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <button
                        onClick={() => loadDraft(d)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#083121] hover:underline"
                      >
                        <Edit className="h-4 w-4" /> Sửa
                      </button>
                      <button
                        onClick={() => deleteDraft(d.id)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:underline"
                      >
                        <Trash2 className="h-4 w-4" /> Xoá
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recipient List Modal */}
        {showRecipientList && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white my-10">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Recipients ({recipientCount})
                  </h3>
                  <button
                    onClick={() => setShowRecipientList(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tags
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {matchedCustomers.map((customer) => (
                        <tr key={customer.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {customer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {customer.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="flex flex-wrap gap-1">
                              {customer.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#fcc56c]/20 text-[#083121]"
                                >
                                  {tag}
                                </span>
                              ))}
                              {customer.tags.length > 3 && (
                                <span className="text-xs text-gray-400">
                                  +{customer.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && selectedTemplate && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white my-10">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Email Preview
                  </h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded border">
                  <p className="text-sm text-gray-600">
                    <strong>Subject:</strong> {customSubject || selectedTemplate.subject}
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50 max-h-[70vh] overflow-y-auto">
                  <iframe
                    srcDoc={getPreviewHtml()}
                    className="w-full h-[600px] bg-white rounded"
                    title="Email Preview"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminSidebar>
    </AdminAuth>
  )
}
