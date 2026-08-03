import { apiRequest } from '@/core/lib/api'
import type { ComboImageResponseDto } from '@/core/types'

export function getComboImages(comboId: number) {
  return apiRequest<ComboImageResponseDto[]>(`/combo-images/combo/${comboId}`)
}
