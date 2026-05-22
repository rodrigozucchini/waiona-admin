import { requireSession, getSessionUser } from '@/lib/auth'
import { SidebarClient } from '@/components/layout/SidebarClient'
import { HeaderClient } from '@/components/layout/HeaderClient'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireSession()
  const user = await getSessionUser()

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarClient />
      <div className="flex flex-1 flex-col overflow-hidden">
        <HeaderClient email={user?.role ?? 'Admin'} />
        <main id="main-content" className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
