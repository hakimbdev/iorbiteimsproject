import { Navbar } from "@/components/layout/navbar"
import { UserNav } from "@/components/layout/user-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden border-r bg-background lg:block w-64">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-4">
            <h1 className="text-lg font-semibold">eIMS</h1>
          </div>
          <Navbar />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <header className="flex h-14 items-center border-b px-4">
          <div className="flex-1" />
          <UserNav />
        </header>
        <main className="flex-1 space-y-4 p-8 pt-6">
          {children}
        </main>
      </div>
    </div>
  )
} 