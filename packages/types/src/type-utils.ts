export type Optional<T> = {
  [K in keyof T]?: T[K]
}

export type OneOfUnion<T> = T[keyof T]

export const isoStringRegex =
  /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/

export const hexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/

// Only allow a-z 0-9 and no spaces
export const alphanmericRegex = /^[a-z0-9]+$/g
