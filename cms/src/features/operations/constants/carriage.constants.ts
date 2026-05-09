import type { CarriageType } from '../types/operations.types'

export const carriageTypeOptions: Array<{ label: string; value: CarriageType }> = [
  { label: 'Toa ghế ngồi', value: 'SEAT' },
  { label: 'Toa giường nằm', value: 'SLEEPER' },
  { label: 'Toa VIP', value: 'VIP' },
]

export const carriageTypeMeta: Record<CarriageType, { color: string; label: string }> = {
  SEAT: { color: 'blue', label: 'Toa ghế ngồi' },
  SLEEPER: { color: 'purple', label: 'Toa giường nằm' },
  VIP: { color: 'gold', label: 'Toa VIP' },
}

export function getCarriageTypeMeta(type: string) {
  return carriageTypeMeta[type as CarriageType] ?? { color: 'default', label: type }
}
