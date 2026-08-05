import type { StockMovementResponseDto } from '@/core/types'

const OPERATION_LABELS: Record<string, string> = {
  ENTRY: 'Entrada',
  EXIT: 'Salida',
  DAMAGE: 'Daño',
  RETURN: 'Devolución',
}

export function StockMovements({ movements }: { movements: StockMovementResponseDto[] }) {
  return (
    <div className="rounded border p-3">
      <span className="text-sm font-medium">Movimientos</span>
      {movements.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-500">Sin movimientos todavía.</p>
      ) : (
        <table className="mt-2 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-1">Fecha</th>
              <th className="py-1">Operación</th>
              <th className="py-1">Flujo</th>
              <th className="py-1">Cantidad</th>
              <th className="py-1">Referencia</th>
            </tr>
          </thead>
          <tbody>
            {movements
              .slice()
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((movement) => (
                <tr key={movement.id} className="border-b">
                  <td className="py-1">{new Date(movement.createdAt).toLocaleString('es-AR')}</td>
                  <td className="py-1">{OPERATION_LABELS[movement.operationType] ?? movement.operationType}</td>
                  <td className="py-1">{movement.stockFlow}</td>
                  <td className="py-1">{movement.quantity}</td>
                  <td className="py-1">
                    {movement.referenceType}
                    {movement.referenceId != null && ` #${movement.referenceId}`}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
