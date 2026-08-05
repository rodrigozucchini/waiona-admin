import type { CouponUsageResponseDto } from '@/core/types'

export function CouponUsageList({ usage }: { usage: CouponUsageResponseDto[] }) {
  return (
    <div className="rounded border p-3">
      <span className="text-sm font-medium">Usos</span>
      {usage.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-500">Todavía no se usó.</p>
      ) : (
        <table className="mt-2 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-1">Orden</th>
              <th className="py-1">Usuario</th>
              <th className="py-1">Aplicado</th>
            </tr>
          </thead>
          <tbody>
            {usage.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="py-1">#{u.orderId}</td>
                <td className="py-1">#{u.userId}</td>
                <td className="py-1">{new Date(u.appliedAt).toLocaleString('es-AR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
