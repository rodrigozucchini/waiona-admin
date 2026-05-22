'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navItems } from './nav-items'
import {
  LayoutDashboard,
  Package,
  DollarSign,
  Receipt,
  Warehouse,
  Tag,
  ShoppingCart,
  Users,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const iconMap = {
  LayoutDashboard,
  Package,
  DollarSign,
  Receipt,
  Warehouse,
  Tag,
  ShoppingCart,
  Users,
}

export function SidebarClient() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState<string[]>(['Catálogo', 'Inventario'])

  function toggleGroup(label: string) {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    )
  }

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-background transition-all duration-200',
        collapsed ? 'w-14' : 'w-56'
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-3">
        {!collapsed && (
          <span className="font-semibold text-sm">Waiona Admin</span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto rounded p-1 hover:bg-muted"
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto py-2">
        <ul role="list" className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap]

            if (item.children) {
              const isOpen = openGroups.includes(item.label)
              const isGroupActive = item.children.some((c) => pathname.startsWith(c.href))

              return (
                <li key={item.label}>
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted',
                      isGroupActive && 'text-foreground font-medium'
                    )}
                  >
                    <Icon size={16} className="shrink-0" aria-hidden="true" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </>
                    )}
                  </button>
                  {!collapsed && isOpen && (
                    <ul role="list" className="ml-6 mt-0.5 space-y-0.5">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            aria-current={pathname === child.href ? 'page' : undefined}
                            className={cn(
                              'block rounded px-2 py-1.5 text-sm hover:bg-muted',
                              pathname === child.href
                                ? 'bg-muted font-medium text-foreground'
                                : 'text-muted-foreground'
                            )}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href!}
                  aria-current={pathname === item.href ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted',
                    pathname === item.href
                      ? 'bg-muted font-medium text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  <Icon size={16} className="shrink-0" aria-hidden="true" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
