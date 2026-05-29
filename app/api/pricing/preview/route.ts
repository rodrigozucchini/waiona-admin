import { api, ApiError } from '@/lib/api'
import { NextRequest } from 'next/server'
import type { PriceBreakdown } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = await api.post<PriceBreakdown>('/pricing/calculate/preview', body)
    return Response.json(data)
  } catch (err) {
    if (err instanceof ApiError) {
      return Response.json({ message: err.message }, { status: err.status })
    }
    return Response.json({ message: 'Error interno' }, { status: 500 })
  }
}
