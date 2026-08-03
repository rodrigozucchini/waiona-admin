import { notFound } from 'next/navigation'
import { getTax } from '@/services/tax.service'
import { ApiError } from '@/core/lib/api'
import { TaxForm } from '../TaxForm'

export default async function EditTaxPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const tax = await getTax(Number(id)).catch((error) => {
    if (error instanceof ApiError && error.statusCode === 404) notFound()
    throw error
  })

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Editar impuesto</h1>
      <TaxForm tax={tax} />
    </div>
  )
}
