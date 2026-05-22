import { NextRequest } from 'next/server'
import { ApiError } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(`${process.env.API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Error desconocido' }))
      return Response.json({ message: err.message }, { status: res.status })
    }

    return Response.json(await res.json())
  } catch (err) {
    if (err instanceof ApiError) {
      return Response.json({ message: err.message }, { status: err.status })
    }
    return Response.json({ message: 'Error interno' }, { status: 500 })
  }
}
