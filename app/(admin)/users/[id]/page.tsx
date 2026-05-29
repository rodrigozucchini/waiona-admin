import { api, ApiError } from '@/lib/api'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { User, PaginatedResponse, Order, OrderStatus } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  client: 'Cliente',
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending:    { label: 'Pendiente',   className: 'bg-yellow-100 text-yellow-700' },
  confirmed:  { label: 'Confirmada',  className: 'bg-blue-100 text-blue-700' },
  dispatched: { label: 'Despachada',  className: 'bg-indigo-100 text-indigo-700' },
  delivered:  { label: 'Entregada',   className: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Cancelada',   className: 'bg-red-100 text-red-700' },
}

export default async function UserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { id } = await params
  const { page = '1' } = await searchParams

  let user: User
  try {
    user = await api.get<User>(`/users/${id}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    if (err instanceof ApiError && err.status === 403) redirect('/users')
    throw err
  }

  const ordersResult = await api.get<PaginatedResponse<Order>>(
    `/orders/user/${id}?page=${page}&limit=10`
  )

  const { data: orders, total: totalOrders, totalPages } = ordersResult
  const currentPage = Number(page)
  const fullName = user.profile
    ? `${user.profile.name} ${user.profile.lastName}`
    : null

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-1 flex gap-1 text-sm text-muted-foreground">
          <Link href="/users" className="hover:underline">Usuarios</Link>
          <span>/</span>
          <span className="text-foreground">{fullName ?? `#${user.id}`}</span>
        </nav>
        <h1 className="text-2xl font-semibold">{fullName ?? user.email}</h1>
        <p className="text-sm text-muted-foreground">Miembro desde {formatDate(user.createdAt)}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User info card */}
        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3 text-sm">
            <h2 className="font-medium">Información</h2>
            <dl className="space-y-2 text-muted-foreground">
              <div className="flex justify-between gap-4">
                <dt>ID</dt>
                <dd className="font-mono text-foreground">#{user.id}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Email</dt>
                <dd className="text-foreground break-all">{user.email}</dd>
              </div>
              {user.profile && (
                <>
                  <div className="flex justify-between gap-4">
                    <dt>Nombre</dt>
                    <dd className="text-foreground">{user.profile.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Apellido</dt>
                    <dd className="text-foreground">{user.profile.lastName}</dd>
                  </div>
                </>
              )}
              <div className="flex justify-between gap-4">
                <dt>Rol</dt>
                <dd>
                  <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                    {user.role ? (roleLabels[user.role] ?? user.role) : '—'}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Estado</dt>
                <dd>
                  {user.isActive ? (
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Activo</span>
                  ) : (
                    <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">Pendiente activación</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Registrado</dt>
                <dd className="text-foreground">{formatDate(user.createdAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border p-4 text-sm">
            <h2 className="font-medium mb-2">Órdenes</h2>
            <p className="text-3xl font-bold">{totalOrders}</p>
            <p className="text-muted-foreground text-xs mt-0.5">en total</p>
          </div>
        </div>

        {/* Orders */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-medium">Historial de órdenes</h2>

          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Este usuario no tiene órdenes.</p>
          ) : (
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-medium">#</th>
                    <th scope="col" className="px-4 py-3 text-left font-medium">Estado</th>
                    <th scope="col" className="px-4 py-3 text-left font-medium">Entrega</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
                    <th scope="col" className="px-4 py-3 text-left font-medium">Fecha</th>
                    <th scope="col" className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => {
                    const cfg = statusConfig[order.status]
                    return (
                      <tr key={order.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-mono text-muted-foreground">#{order.id}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded px-2 py-0.5 text-xs ${cfg.className}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {order.deliveryType === 'pickup' ? 'Retiro' : 'Delivery'}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/orders/${order.id}`}
                            className="text-sm text-primary hover:underline"
                          >
                            Ver orden
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{totalOrders} órdenes</span>
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/users/${id}?page=${currentPage - 1}`}
                    className="rounded-md border px-3 py-1.5 hover:bg-muted"
                  >
                    Anterior
                  </Link>
                )}
                <span className="px-3 py-1.5 text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                {currentPage < totalPages && (
                  <Link
                    href={`/users/${id}?page=${currentPage + 1}`}
                    className="rounded-md border px-3 py-1.5 hover:bg-muted"
                  >
                    Siguiente
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
