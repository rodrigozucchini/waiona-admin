import Link from 'next/link'
import { getTaxes } from '@/services/tax.service'
import { DeleteTaxButton } from './DeleteTaxButton'

export default async function TaxesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const {
    data,
    page: currentPage,
    totalPages,
  } = await getTaxes({ page: page ? Number(page) : 1 })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Impuestos</h1>
        <Link href="/taxes/new" className="rounded bg-black px-3 py-2 text-white">
          Nuevo impuesto
        </Link>
      </div>

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">Código</th>
            <th className="py-2">Nombre</th>
            <th className="py-2">Valor</th>
            <th className="py-2">Global</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {data.map((tax) => (
            <tr key={tax.id} className="border-b">
              <td className="py-2">{tax.code}</td>
              <td className="py-2">{tax.name}</td>
              <td className="py-2">{tax.value}%</td>
              <td className="py-2">{tax.isGlobal ? 'Sí' : 'No'}</td>
              <td className="py-2 text-right">
                <Link href={`/taxes/${tax.id}`} className="mr-4 text-sm underline">
                  Editar
                </Link>
                <DeleteTaxButton id={tax.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-4 text-sm">
        {currentPage > 1 && <Link href={`/taxes?page=${currentPage - 1}`}>Anterior</Link>}
        {currentPage < totalPages && (
          <Link href={`/taxes?page=${currentPage + 1}`}>Siguiente</Link>
        )}
      </div>
    </div>
  )
}
