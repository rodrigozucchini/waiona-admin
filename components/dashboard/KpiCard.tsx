const colorMap = {
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  blue: 'bg-blue-50 border-blue-200 text-blue-800',
  green: 'bg-green-50 border-green-200 text-green-800',
  red: 'bg-red-50 border-red-200 text-red-800',
  purple: 'bg-purple-50 border-purple-200 text-purple-800',
}

interface Props {
  label: string
  value: string | number
  color: keyof typeof colorMap
}

export function KpiCard({ label, value, color }: Props) {
  return (
    <div className={`rounded-lg border p-4 ${colorMap[color]}`}>
      <p className="text-sm opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  )
}
