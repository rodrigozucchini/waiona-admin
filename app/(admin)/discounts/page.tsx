import Link from 'next/link'
import { getDiscounts } from '@/services/discount.service'
import { DeleteDiscountButton } from './DeleteDiscountButton'

export default async function DiscountsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const {
    data,
    page: currentPage,
    totalPages,
  } = await getDiscounts({ page: page ? Number(page) : 1 })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Descuentos</h1>
        <Link href="/discounts/new" className="rounded bg-black px-3 py-2 text-white">
          Nuevo descuento
        </Link>
      </div>

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">Nombre</th>
            <th className="py-2">Descripción</th>
            <th className="py-2">Valor</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {data.map((discount) => (
            <tr key={discount.id} className="border-b">
              <td className="py-2">{discount.name}</td>
              <td className="py-2">{discount.description ?? '-'}</td>
              <td className="py-2">{discount.value}%</td>
              <td className="py-2 text-right">
                <Link href={`/discounts/${discount.id}`} className="mr-4 text-sm underline">
                  Editar
                </Link>
                <DeleteDiscountButton id={discount.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-4 text-sm">
        {currentPage > 1 && <Link href={`/discounts?page=${currentPage - 1}`}>Anterior</Link>}
        {currentPage < totalPages && (
          <Link href={`/discounts?page=${currentPage + 1}`}>Siguiente</Link>
        )}
      </div>
    </div>
  )
}
