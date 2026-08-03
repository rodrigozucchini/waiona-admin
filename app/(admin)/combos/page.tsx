import Link from 'next/link'
import { getCombos } from '@/services/combo.service'
import { DeleteComboButton } from './DeleteComboButton'

export default async function CombosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const {
    data,
    page: currentPage,
    totalPages,
  } = await getCombos({ page: page ? Number(page) : 1 })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Combos</h1>
        <Link href="/combos/new" className="rounded bg-black px-3 py-2 text-white">
          Nuevo combo
        </Link>
      </div>

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">Nombre</th>
            <th className="py-2">Categoría</th>
            <th className="py-2">Ítems</th>
            <th className="py-2">Activo</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {data.map((combo) => (
            <tr key={combo.id} className="border-b">
              <td className="py-2">{combo.name}</td>
              <td className="py-2">{combo.categoryName}</td>
              <td className="py-2">{combo.items.length}</td>
              <td className="py-2">{combo.isActive ? 'Sí' : 'No'}</td>
              <td className="py-2 text-right">
                <Link href={`/combos/${combo.id}`} className="mr-4 text-sm underline">
                  Editar
                </Link>
                <DeleteComboButton id={combo.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-4 text-sm">
        {currentPage > 1 && <Link href={`/combos?page=${currentPage - 1}`}>Anterior</Link>}
        {currentPage < totalPages && (
          <Link href={`/combos?page=${currentPage + 1}`}>Siguiente</Link>
        )}
      </div>
    </div>
  )
}
