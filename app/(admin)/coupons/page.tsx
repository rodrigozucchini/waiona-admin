import Link from 'next/link'
import { getCoupons } from '@/services/coupon.service'
import { CouponStatus } from '@/core/enums'
import { DeleteCouponButton } from './DeleteCouponButton'

const STATUS_LABELS: Record<CouponStatus, string> = {
  [CouponStatus.ACTIVE]: 'Activo',
  [CouponStatus.SCHEDULED]: 'Programado',
  [CouponStatus.EXPIRED]: 'Expirado',
  [CouponStatus.EXHAUSTED]: 'Agotado',
}

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const {
    data,
    page: currentPage,
    totalPages,
  } = await getCoupons({ page: page ? Number(page) : 1 })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cupones</h1>
        <Link href="/coupons/new" className="rounded bg-black px-3 py-2 text-white">
          Nuevo cupón
        </Link>
      </div>

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">Código</th>
            <th className="py-2">Estado</th>
            <th className="py-2">Valor</th>
            <th className="py-2">Global</th>
            <th className="py-2">Usos</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {data.map((coupon) => (
            <tr key={coupon.id} className="border-b">
              <td className="py-2">{coupon.code}</td>
              <td className="py-2">{STATUS_LABELS[coupon.status]}</td>
              <td className="py-2">{coupon.value}%</td>
              <td className="py-2">{coupon.isGlobal ? 'Sí' : 'No'}</td>
              <td className="py-2">
                {coupon.usageCount}
                {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ''}
              </td>
              <td className="py-2 text-right">
                <Link href={`/coupons/${coupon.id}`} className="mr-4 text-sm underline">
                  Editar
                </Link>
                <DeleteCouponButton id={coupon.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-4 text-sm">
        {currentPage > 1 && <Link href={`/coupons?page=${currentPage - 1}`}>Anterior</Link>}
        {currentPage < totalPages && (
          <Link href={`/coupons?page=${currentPage + 1}`}>Siguiente</Link>
        )}
      </div>
    </div>
  )
}
