"use client"

import AdminAuth from '@/components/admin/AdminAuth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import KitchenView from '@/components/admin/KitchenView'

export default function KitchenPage() {
  return (
    <AdminAuth>
      <AdminSidebar>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Kitchen View</h1>
          <KitchenView />
        </div>

      </AdminSidebar>
    </AdminAuth>
  )
}
