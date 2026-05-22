import { NextRequest } from 'next/server'
import { api, ApiError } from '@/lib/api'

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type')

  const paths: Record<string, string> = {
    orders: '/analytics/orders',
    'top-products': '/analytics/products/top',
    'critical-stock': '/analytics/stock/critical',
  }

  if (!type || !paths[type]) {
    return Response.json({ message: 'Parámetro type inválido' }, { status: 400 })
  }

  try {
    const data = await api.get(paths[type])
    return Response.json(data)
  } catch (err) {
    if (err instanceof ApiError) {
      return Response.json({ message: err.message }, { status: err.status })
    }
    return Response.json({ message: 'Error interno' }, { status: 500 })
  }
}
