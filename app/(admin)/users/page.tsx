import { getUsers } from '@/services/user.service'
import { RoleType } from '@/core/enums'
import Link from 'next/link'

const ROLE_LABELS: Record<RoleType, string> = {
  [RoleType.SUPER_ADMIN]: 'Super admin',
  [RoleType.ADMIN]: 'Admin',
  [RoleType.CLIENT]: 'Cliente',
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; email?: string; name?: string }>
}) {
  const { page, email, name } = await searchParams
  const {
    data,
    page: currentPage,
    totalPages,
  } = await getUsers({
    page: page ? Number(page) : 1,
    ...(email && { email }),
    ...(name && { name }),
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Solo lectura: la API no permite ver, editar ni borrar la cuenta de otro usuario, ni
          siquiera con rol admin.
        </p>
      </div>

      <form className="flex gap-2">
        <input
          type="text"
          name="email"
          defaultValue={email}
          placeholder="Buscar por email"
          className="rounded border px-3 py-2 text-sm"
        />
        <input
          type="text"
          name="name"
          defaultValue={name}
          placeholder="Buscar por nombre o apellido"
          className="rounded border px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded border px-3 py-2 text-sm">
          Buscar
        </button>
      </form>

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">Email</th>
            <th className="py-2">Nombre</th>
            <th className="py-2">Rol</th>
            <th className="py-2">Activo</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="py-2">{user.email}</td>
              <td className="py-2">
                {user.profile.name} {user.profile.lastName}
              </td>
              <td className="py-2">{ROLE_LABELS[user.role]}</td>
              <td className="py-2">{user.isActive ? 'Sí' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-4 text-sm">
        {currentPage > 1 && (
          <Link
            href={`/users?page=${currentPage - 1}${email ? `&email=${email}` : ''}${name ? `&name=${name}` : ''}`}
          >
            Anterior
          </Link>
        )}
        {currentPage < totalPages && (
          <Link
            href={`/users?page=${currentPage + 1}${email ? `&email=${email}` : ''}${name ? `&name=${name}` : ''}`}
          >
            Siguiente
          </Link>
        )}
      </div>
    </div>
  )
}
