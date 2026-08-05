'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { deleteCoupon } from '@/actions/coupon.actions'

export function DeleteCouponButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('¿Borrar este cupón?')) return
    startTransition(async () => {
      const result = await deleteCoupon(id)
      if (!result.success) toast.error(result.message)
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-sm text-red-600 disabled:opacity-50"
    >
      Borrar
    </button>
  )
}
