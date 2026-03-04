"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BookOpen,
  FileText,
  MessageSquare,
  Image,
  Settings,
  X,
  Menu,
  LogOut,
  User,
  Calendar,
  Mail,
  Send,
} from "lucide-react"

interface AdminSidebarProps {
  children: React.ReactNode
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: User },
  { name: "Email Campaigns", href: "/admin/email-marketing/campaigns", icon: Send },
  { name: "Email Templates", href: "/admin/email-templates", icon: Mail },
  { name: "Courses", href: "/admin/courses", icon: BookOpen },
  { name: "Events", href: "/admin/events", icon: Calendar },
  { name: "Blog Posts", href: "/admin/blog", icon: FileText },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "Media Library", href: "/admin/media", icon: Image },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminSidebar({ children }: AdminSidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-white">
                  Bonu Cakes Admin
                </h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex bg-gray-700 p-4">
              <div className="flex items-center w-full">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-600">
                  <User className="h-5 w-5 text-gray-300" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {session?.user?.name || session?.user?.email}
                  </p>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center text-xs text-gray-300 hover:text-white"
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-gray-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-white">
                  Bonu Cakes Admin
                </h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex bg-gray-700 p-4">
              <div className="flex items-center w-full">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-600">
                  <User className="h-5 w-5 text-gray-300" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {session?.user?.name || session?.user?.email}
                  </p>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center text-xs text-gray-300 hover:text-white"
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile header with menu button */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">
            Bonu Cakes Admin
          </h1>
          <button
            type="button"
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
