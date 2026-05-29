import { api } from '@/lib/api'
import Link from 'next/link'
import type { PaginatedResponse, User } from '@/types'
import { formatDate } from '@/lib/utils'
import { UsersSearchClient } from './UsersSearchClient'

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  client: 'Cliente',
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; name?: string; email?: string }>
}) {
  const { page = '1', name, email } = await searchParams

  const query = new URLSearchParams({ page, limit: '20' })
  if (name) query.set('name', name)
  if (email) query.set('email', email)

  const result = await api.get<PaginatedResponse<User>>(`/users?${query}`)
  const { data: users, total, totalPages } = result
  const currentPage = Number(page)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            {total} usuario{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}.
          </p>
        </div>
        <UsersSearchClient />
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay usuarios que coincidan.</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">#</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Email</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Nombre</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Rol</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Estado</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => {
                const fullName = user.profile
                  ? `${user.profile.name} ${user.profile.lastName}`
                  : null
                return (
                  <tr key={user.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-muted-foreground">#{user.id}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {fullName ?? <span className="italic text-xs">Sin perfil</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                        {user.role ? (roleLabels[user.role] ?? user.role) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.isActive ? (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Activo</span>
                      ) : (
                        <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">Pendiente</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(user.createdAt)}
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
          <span className="text-muted-foreground">{total} usuarios</span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/users?${new URLSearchParams({ page: String(currentPage - 1), ...(name && { name }), ...(email && { email }) })}`}
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
                href={`/users?${new URLSearchParams({ page: String(currentPage + 1), ...(name && { name }), ...(email && { email }) })}`}
                className="rounded-md border px-3 py-1.5 hover:bg-muted"
              >
                Siguiente
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
