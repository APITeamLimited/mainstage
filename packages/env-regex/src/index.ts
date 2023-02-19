import {
  MatchResult,
  rawContainsEnvVariables,
  rawMatchAllEnvVariables,
} from './env-regex-raw/pkg/env_regex'

export const containsEnvVariables = rawContainsEnvVariables as (
  path: string
) => boolean

export const matchAllEnvVariables = rawMatchAllEnvVariables as (
  path: string
) => MatchResult[]

export type { MatchResult } from './env-regex-raw/pkg/env_regex'
