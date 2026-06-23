import { api } from '@/lib/api'
import Link from 'next/link'
import type { PaginatedResponse, Discount } from '@/types'

export default async function DiscountsPage() {
  const result = await api.get<PaginatedResponse<Discount>>('/discounts?limit=100')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Descuentos</h1>
          <p className="text-sm text-muted-foreground">Descuentos automáticos aplicados por el sistema.</p>
        </div>
        <Link
          href="/promotions/discounts/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Nuevo descuento
        </Link>
      </div>

      {result.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay descuentos configurados.</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">Nombre</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Valor</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {result.data.map((discount) => (
                <tr key={discount.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{discount.name}</td>
                  <td className="px-4 py-3">{discount.value}%</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/promotions/discounts/${discount.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
