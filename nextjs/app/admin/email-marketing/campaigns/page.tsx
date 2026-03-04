"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminAuth from "@/components/admin/AdminAuth"
import { Mail, Send, Users, Filter, Eye, X } from "lucide-react"

interface EmailTemplate {
  id: number
  name: string
  displayName: string
  subject: string
  htmlContent: string
  variables: string[]
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

  // Available filter options
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [availableLocations, setAvailableLocations] = useState<string[]>([])

  useEffect(() => {
    fetchTemplates()
    fetchFilterOptions()
  }, [])

  useEffect(() => {
    if (selectedTemplate) {
      setCustomSubject(selectedTemplate.subject)
    }
  }, [selectedTemplate])

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

    if (recipientCount === 0) {
      alert("No recipients match your filters")
      return
    }

    if (!confirm(`Send campaign to ${recipientCount} recipients?`)) {
      return
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
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to send campaign")

      alert(`Campaign sent successfully to ${recipientCount} recipients!`)

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
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500"
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
                            ? "border-amber-500 bg-amber-50"
                            : "border-gray-200 hover:border-amber-300"
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
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500"
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
                              ? "bg-amber-100 text-amber-800 border-2 border-amber-500"
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
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500"
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
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500"
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
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
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
                  disabled={!selectedTemplate || !campaignName || recipientCount === 0 || sending}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? "Sending..." : "Send Campaign"}
                </button>
              </div>

              {/* Selected Filters Summary */}
              {(filters.tags.length > 0 || filters.location) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Active Filters:</h4>
                  <div className="space-y-1">
                    {filters.tags.length > 0 && (
                      <p className="text-sm text-blue-700">
                        Tags: {filters.tags.join(", ")}
                      </p>
                    )}
                    {filters.location && (
                      <p className="text-sm text-blue-700">
                        Location: {filters.location}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

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
