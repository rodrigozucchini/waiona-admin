'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createCoupon, updateCoupon } from '@/actions/coupon.actions'
import type { CouponResponseDto } from '@/core/types'

interface CouponFormProps {
  coupon?: CouponResponseDto
}

function toDateInput(iso: string | null) {
  return iso ? iso.slice(0, 10) : ''
}

export function CouponForm({ coupon }: CouponFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [code, setCode] = useState(coupon?.code ?? '')
  const [value, setValue] = useState(coupon?.value != null ? String(coupon.value) : '')
  const [isGlobal, setIsGlobal] = useState(coupon?.isGlobal ?? false)
  const [usageLimit, setUsageLimit] = useState(coupon?.usageLimit != null ? String(coupon.usageLimit) : '')
  const [startsAt, setStartsAt] = useState(toDateInput(coupon?.startsAt ?? null))
  const [endsAt, setEndsAt] = useState(toDateInput(coupon?.endsAt ?? null))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      code: code.toUpperCase(),
      value: Number(value),
      isGlobal,
      ...(usageLimit && { usageLimit: Number(usageLimit) }),
      ...(startsAt && { startsAt: new Date(startsAt).toISOString() }),
      ...(endsAt && { endsAt: new Date(endsAt).toISOString() }),
    }

    startTransition(async () => {
      const result = coupon ? await updateCoupon(coupon.id, payload) : await createCoupon(payload)

      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(coupon ? 'Cupón actualizado' : 'Cupón creado')
      router.push('/coupons')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      <input
        required
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Código"
        className="rounded border px-3 py-2"
      />
      <input
        required
        type="number"
        min={0.01}
        max={100}
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Valor (%)"
        className="rounded border px-3 py-2"
      />
      <input
        type="number"
        min={1}
        value={usageLimit}
        onChange={(e) => setUsageLimit(e.target.value)}
        placeholder="Límite de usos (opcional)"
        className="rounded border px-3 py-2"
      />
      <label className="flex flex-col gap-1 text-sm">
        Vigencia desde (opcional)
        <input
          type="date"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Vigencia hasta (opcional)
        <input
          type="date"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isGlobal} onChange={(e) => setIsGlobal(e.target.checked)} />
        Global (aplica a cualquier orden, sin asignar productos/combos)
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {isPending ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
