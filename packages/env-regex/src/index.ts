import {
  rawContainsEnvVariables,
  rawMatchAllEnvVariables,
} from './env-regex-raw/pkg/env_regex'

export const containsEnvVariables = rawContainsEnvVariables as (
  path: string
) => boolean

export type MatchResult = {
  text: string
  start: number
  end: number
}

export const matchAllEnvVariables = rawMatchAllEnvVariables as (
  path: string
) => MatchResult[]
