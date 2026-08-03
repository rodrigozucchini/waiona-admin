import Link from 'next/link'
import { getProducts } from '@/services/product.service'
import { DeleteProductButton } from './DeleteProductButton'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const {
    data,
    page: currentPage,
    totalPages,
  } = await getProducts({ page: page ? Number(page) : 1 })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <Link href="/products/new" className="rounded bg-black px-3 py-2 text-white">
          Nuevo producto
        </Link>
      </div>

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">SKU</th>
            <th className="py-2">Nombre</th>
            <th className="py-2">Categoría</th>
            <th className="py-2">Activo</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {data.map((product) => (
            <tr key={product.id} className="border-b">
              <td className="py-2">{product.sku}</td>
              <td className="py-2">{product.name}</td>
              <td className="py-2">{product.categoryName}</td>
              <td className="py-2">{product.isActive ? 'Sí' : 'No'}</td>
              <td className="py-2 text-right">
                <Link href={`/products/${product.id}`} className="mr-4 text-sm underline">
                  Editar
                </Link>
                <DeleteProductButton id={product.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-4 text-sm">
        {currentPage > 1 && <Link href={`/products?page=${currentPage - 1}`}>Anterior</Link>}
        {currentPage < totalPages && (
          <Link href={`/products?page=${currentPage + 1}`}>Siguiente</Link>
        )}
      </div>
    </div>
  )
}
