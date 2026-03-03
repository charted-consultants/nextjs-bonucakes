"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminAuth from "@/components/admin/AdminAuth"
import { Mail, Users, Search, Filter, Download, Plus, Edit, Trash2, Check, X } from "lucide-react"

interface Customer {
  id: number
  name: string
  email: string
  phone: string | null
  marketingConsent: boolean
  consentedAt: string | null
  consentSource: string | null
  tags: string[]
  segment: string | null
  notes: string | null
  orderCount: number
  totalSpent: number
  lastOrderDate: string | null
  createdAt: string
}

interface EmailTemplate {
  id: number
  name: string
  displayName: string
  subject: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailContent, setEmailContent] = useState("")
  const [emailTemplate, setEmailTemplate] = useState("plain")
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [sending, setSending] = useState(false)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)

  // New customer form fields
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    marketingConsent: false,
    tags: [] as string[],
    segment: "",
    notes: ""
  })

  useEffect(() => {
    fetchCustomers()
    fetchEmailTemplates()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/customers")
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to fetch customers")

      setCustomers(data.customers)
    } catch (err: any) {
      console.error("Error fetching customers:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmailTemplates = async () => {
    try {
      const res = await fetch("/api/admin/email-templates")
      const data = await res.json()

      if (res.ok && data.templates) {
        setEmailTemplates(data.templates.filter((t: any) => t.active))
      }
    } catch (err: any) {
      console.error("Error fetching email templates:", err)
    }
  }

  const toggleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id))
    }
  }

  const toggleSelectCustomer = (id: number) => {
    if (selectedCustomers.includes(id)) {
      setSelectedCustomers(selectedCustomers.filter(cId => cId !== id))
    } else {
      setSelectedCustomers([...selectedCustomers, id])
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sendBulkEmail = async () => {
    if (selectedCustomers.length === 0) {
      alert("Please select at least one customer")
      return
    }

    if (!emailSubject || !emailContent) {
      alert("Please fill in subject and content")
      return
    }

    try {
      setSending(true)

      const selectedEmails = customers
        .filter(c => selectedCustomers.includes(c.id))
        .map(c => ({ email: c.email, name: c.name }))

      const res = await fetch("/api/admin/send-bulk-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: selectedEmails,
          subject: emailSubject,
          content: emailContent,
          template: selectedTemplateId ? undefined : emailTemplate, // Use fallback template only if no DB template selected
          templateId: selectedTemplateId,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to send emails")

      alert(`Successfully sent ${data.sent} emails`)
      setShowEmailModal(false)
      setEmailSubject("")
      setEmailContent("")
      setSelectedCustomers([])
    } catch (err: any) {
      alert("Error sending emails: " + err.message)
    } finally {
      setSending(false)
    }
  }

  const addCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      alert("Please fill in name and email")
      return
    }

    try {
      setSaving(true)
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to add customer")

      alert("Customer added successfully")
      setShowAddModal(false)
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        marketingConsent: false,
        tags: [],
        segment: "",
        notes: ""
      })
      fetchCustomers()
    } catch (err: any) {
      alert("Error adding customer: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteCustomer = async (id: number) => {
    if (!confirm("Are you sure you want to delete this customer?")) return

    try {
      const res = await fetch(`/api/admin/customers?id=${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete customer")
      }

      alert("Customer deleted successfully")
      fetchCustomers()
    } catch (err: any) {
      alert("Error deleting customer: " + err.message)
    }
  }

  const importFromResend = async () => {
    if (!confirm("This will import customer email addresses from previously sent Resend emails. Continue?")) {
      return
    }

    try {
      setImporting(true)
      const res = await fetch("/api/admin/import-customers-from-resend", {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to import customers")

      alert(
        `Import complete!\n\n` +
        `Total emails fetched: ${data.totalEmailsFetched}\n` +
        `Bonu emails found: ${data.bonuEmailsFound}\n` +
        `Unique customers: ${data.uniqueCustomers}\n` +
        `Created: ${data.created}\n` +
        `Skipped (already exist): ${data.skipped}`
      )

      fetchCustomers()
    } catch (err: any) {
      alert("Error importing customers: " + err.message)
    } finally {
      setImporting(false)
    }
  }

  const exportCustomers = () => {
    const csv = [
      ["Name", "Email", "Phone", "Marketing Consent", "Orders", "Total Spent", "Last Order", "Joined"],
      ...filteredCustomers.map(c => [
        c.name,
        c.email,
        c.phone || "",
        c.marketingConsent ? "Yes" : "No",
        c.orderCount,
        c.totalSpent,
        c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : "",
        new Date(c.createdAt).toLocaleDateString(),
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `customers-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <AdminAuth>
      <AdminSidebar>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage customers and send bulk emails
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={importFromResend}
                disabled={importing}
                className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 disabled:opacity-50"
              >
                <Mail className="h-4 w-4 mr-2" />
                {importing ? "Importing..." : "Import from Resend"}
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </button>
              <button
                onClick={exportCustomers}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              {selectedCustomers.length > 0 && (
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Selected ({selectedCustomers.length})
                </button>
              )}
            </div>
          </div>

          {/* Search and filters */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Customers table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading customers...</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {searchQuery ? "No customers found matching your search" : "No customers yet"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.length === filteredCustomers.length}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marketing
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedCustomers.includes(customer.id)}
                            onChange={() => toggleSelectCustomer(customer.id)}
                            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{customer.email}</div>
                          {customer.phone && (
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {customer.marketingConsent ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Check className="h-3 w-3 mr-1" />
                              Opted In
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <X className="h-3 w-3 mr-1" />
                              Not Opted
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.orderCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          £{customer.totalSpent.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.lastOrderDate
                            ? new Date(customer.lastOrderDate).toLocaleDateString("en-GB")
                            : "Never"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(customer.createdAt).toLocaleDateString("en-GB")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => deleteCustomer(customer.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete customer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Send Email to {selectedCustomers.length} Customer(s)
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template
                    </label>
                    <select
                      value={selectedTemplateId || emailTemplate}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value.startsWith("db-")) {
                          const templateId = parseInt(value.replace("db-", ""))
                          setSelectedTemplateId(templateId)
                          const template = emailTemplates.find(t => t.id === templateId)
                          if (template && template.subject) {
                            setEmailSubject(template.subject)
                          }
                        } else {
                          setSelectedTemplateId(null)
                          setEmailTemplate(value)
                        }
                      }}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500"
                    >
                      <optgroup label="Saved Templates">
                        {emailTemplates.map(template => (
                          <option key={template.id} value={`db-${template.id}`}>
                            {template.displayName}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Basic Templates">
                        <option value="plain">Plain Text</option>
                        <option value="newsletter">Newsletter</option>
                        <option value="promotion">Promotion</option>
                        <option value="announcement">Announcement</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Email subject..."
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      placeholder="Email content..."
                      rows={10}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      You can use HTML tags. Use {"{name}"} to personalize with customer name.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendBulkEmail}
                    disabled={sending}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Send Emails"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Customer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Add New Customer
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                      placeholder="Customer name"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                      placeholder="customer@example.com"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                      placeholder="+44 7XXX XXXXXX"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newCustomer.marketingConsent}
                        onChange={(e) => setNewCustomer({...newCustomer, marketingConsent: e.target.checked})}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Marketing consent (customer has opted in to receive marketing emails)
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Segment
                    </label>
                    <select
                      value={newCustomer.segment}
                      onChange={(e) => setNewCustomer({...newCustomer, segment: e.target.value})}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="">None</option>
                      <option value="vip">VIP</option>
                      <option value="regular">Regular</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={newCustomer.notes}
                      onChange={(e) => setNewCustomer({...newCustomer, notes: e.target.value})}
                      placeholder="Internal notes about this customer..."
                      rows={3}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addCustomer}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? "Adding..." : "Add Customer"}
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
