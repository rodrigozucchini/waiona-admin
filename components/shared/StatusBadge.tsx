interface Props {
  active: boolean
  labelActive?: string
  labelInactive?: string
}

export function StatusBadge({
  active,
  labelActive = 'Activo',
  labelInactive = 'Inactivo',
}: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
        active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {active ? labelActive : labelInactive}
    </span>
  )
}
