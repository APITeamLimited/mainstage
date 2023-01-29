import { z } from 'zod'

export const AVAILABLE_LOAD_ZONES = [
  'europe-west2',
  'northamerica-northeast1',
  'northamerica-northeast2',
  'southamerica-east1',
  'southamerica-west1',
  'us-central1',
  'us-east1',
  'us-east4',
  'us-west1',
  'us-west2',
  'us-west3',
  'us-west4',
  'europe-central2',
  'europe-north1',
  'europe-west1',
  'europe-west3',
  'europe-west4',
  'europe-west6',
  'asia-east1',
  'asia-east2',
  'asia-northeast1',
  'asia-northeast2',
  'asia-northeast3',
  'asia-south1',
  'asia-south2',
  'asia-southeast1',
  'asia-southeast2',
  'australia-southeast1',
  'australia-southeast2',
] as const

export const availableLoadZonesSchema = z.enum(AVAILABLE_LOAD_ZONES)

export type AvailableLoadZone = z.infer<typeof availableLoadZonesSchema>
