"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminAuth from "@/components/admin/AdminAuth"
import { Mail, Plus, Edit, Trash2, Eye, Code } from "lucide-react"

interface EmailTemplate {
  id: number
  name: string
  displayName: string
  description: string | null
  subject: string
  htmlContent: string
  variables: string[]
  category: string | null
  active: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    subject: "",
    htmlContent: "",
    variables: ["name"],
    category: "marketing",
    active: true,
    isDefault: false,
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/email-templates")
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to fetch templates")

      setTemplates(data.templates)
    } catch (err: any) {
      console.error("Error fetching templates:", err)
      alert("Error fetching templates: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingTemplate(null)
    setFormData({
      name: "",
      displayName: "",
      description: "",
      subject: "",
      htmlContent: "",
      variables: ["name"],
      category: "marketing",
      active: true,
      isDefault: false,
    })
    setShowModal(true)
  }

  const openEditModal = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      displayName: template.displayName,
      description: template.description || "",
      subject: template.subject,
      htmlContent: template.htmlContent,
      variables: template.variables,
      category: template.category || "marketing",
      active: template.active,
      isDefault: template.isDefault,
    })
    setShowModal(true)
  }

  const saveTemplate = async () => {
    if (!formData.name || !formData.displayName || !formData.htmlContent) {
      alert("Please fill in name, display name, and HTML content")
      return
    }

    try {
      setSaving(true)

      const url = editingTemplate
        ? "/api/admin/email-templates"
        : "/api/admin/email-templates"

      const method = editingTemplate ? "PUT" : "POST"

      const body = editingTemplate
        ? { ...formData, id: editingTemplate.id }
        : formData

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to save template")

      alert(editingTemplate ? "Template updated successfully" : "Template created successfully")
      setShowModal(false)
      fetchTemplates()
    } catch (err: any) {
      alert("Error saving template: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteTemplate = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return

    try {
      const res = await fetch(`/api/admin/email-templates?id=${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete template")
      }

      alert("Template deleted successfully")
      fetchTemplates()
    } catch (err: any) {
      alert("Error deleting template: " + err.message)
    }
  }

  const previewTemplate = (template: EmailTemplate) => {
    const sampleHtml = template.htmlContent
      .replace(/{name}/g, "John Doe")
      .replace(/{email}/g, "john@example.com")

    setPreviewHtml(sampleHtml)
  }

  return (
    <AdminAuth>
      <AdminSidebar>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage email templates for marketing campaigns
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </button>
          </div>

          {/* Templates Grid */}
          <div className="bg-white shadow rounded-lg">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading templates...</div>
            ) : templates.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No templates yet. Create your first template to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Template
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Variables
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {templates.map((template) => (
                      <tr key={template.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Mail className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {template.displayName}
                              </div>
                              <div className="text-sm text-gray-500">{template.name}</div>
                              {template.description && (
                                <div className="text-xs text-gray-400 mt-1">
                                  {template.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {template.category || "uncategorized"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {template.variables.map(v => `{${v}}`).join(", ")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {template.active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex gap-3">
                            <button
                              onClick={() => previewTemplate(template)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Preview template"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(template)}
                              className="text-amber-600 hover:text-amber-900"
                              title="Edit template"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteTemplate(template.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete template"
                            >
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

        {/* Template Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white my-10">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingTemplate ? "Edit Template" : "New Template"}
                </h3>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Template Name (internal) *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="newsletter-monthly"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Display Name *
                      </label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                        placeholder="Monthly Newsletter"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Template for monthly newsletter campaigns"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Subject Line
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="Your Monthly Newsletter from Bonu Cakes"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="marketing">Marketing</option>
                        <option value="transactional">Transactional</option>
                        <option value="notification">Notification</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-4 pt-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.active}
                          onChange={(e) => setFormData({...formData, active: e.target.checked})}
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      HTML Content * <Code className="inline h-4 w-4" />
                    </label>
                    <textarea
                      value={formData.htmlContent}
                      onChange={(e) => setFormData({...formData, htmlContent: e.target.value})}
                      placeholder="<!DOCTYPE html>..."
                      rows={15}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Use <code className="bg-gray-100 px-1 rounded">{`{name}`}</code>, <code className="bg-gray-100 px-1 rounded">{`{email}`}</code> and other variables to personalize.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveTemplate}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : editingTemplate ? "Update Template" : "Create Template"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewHtml && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white my-10">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Template Preview
                  </h3>
                  <button
                    onClick={() => setPreviewHtml(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50 max-h-[70vh] overflow-y-auto">
                  <iframe
                    srcDoc={previewHtml}
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
