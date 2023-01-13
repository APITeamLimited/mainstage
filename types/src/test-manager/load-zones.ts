import { z } from 'zod'

export const AVAILABLE_LOAD_ZONES = [
  'asia-east2',
  'asia-northeast3',
  'asia-southeast1',
  'asia-southeast2',
  'asia-south1',
  'asia-south2',
  'australia-southeast1',
  'australia-southeast2',
  'europe-central2',
  'europe-west2',
  'europe-west3',
  'europe-west6',
  'northamerica-northeast1',
  'northamerica-northeast2',
  'southamerica-east1',
  'southamerica-west1',
  'us-west2',
  'us-west3',
  'us-west4',
] as const

export const availableLoadZonesSchema = z.enum(AVAILABLE_LOAD_ZONES)

export type AvailableLoadZone = z.infer<typeof availableLoadZonesSchema>
