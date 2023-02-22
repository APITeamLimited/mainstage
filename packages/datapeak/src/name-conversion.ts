type SnakeCase<T> = T extends object
  ? {
      [K in keyof T as K extends string
        ? Uncapitalize<Replace<SnakeToCamel<`${K}`>, '_', ''>>
        : never]: SnakeCase<T[K]>
    }
  : T

type SnakeToCamel<S extends string> = S extends `${infer H}_${infer T}`
  ? `${Lowercase<H>}${SnakeToCamel<Capitalize<T>>}`
  : S

type Replace<
  S extends string,
  From extends string,
  To extends string
> = S extends `${infer Prefix}${From}${infer Suffix}`
  ? `${Prefix}${To}${Replace<Suffix, From, To>}`
  : S

export const convertToRustStyles = <T extends object>(obj: T): SnakeCase<T> => {
  const snakeObj = {} as SnakeCase<T>
  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      const newKey =
        key === 'type'
          ? 'type'
          : key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      const snakeKey = newKey.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      )
      // @ts-expect-error - we know that snakeKey is a valid key
      snakeObj[snakeKey as keyof SnakeCase<T>] =
        typeof obj[key] === 'object'
          ? // @ts-expect-error - we know that key is a valid key
            convertToRustStyles(obj[key])
          : typeof obj[key] === 'string'
          ? // @ts-expect-error - we know that key is a valid key
            capitalizeWords(obj[key])
          : obj[key]
    }
  }
  return snakeObj
}

const capitalizeWords = (s: string) =>
  s
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

type CamelCase<T> = T extends object
  ? {
      [K in keyof T as K extends string
        ? Replace<CamelToSnake<`${K}`>, '_', ''>
        : never]: CamelCase<T[K]>
    }
  : T
type CamelToSnake<S extends string> = S extends `${infer H}${Uppercase<
  infer T
>}${infer R}`
  ? `${Lowercase<H>}_${Lowercase<T>}${CamelToSnake<`${R}`>}`
  : S

export const convertToTSStyles = <T extends object>(
  obj: SnakeCase<T>
): CamelCase<T> => {
  const camelObj = {} as CamelCase<T>
  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      const newKey =
        key === 'type'
          ? 'type'
          : key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      const camelKey = newKey
        .replace(/^[A-Z]/, (letter) => letter.toLowerCase())
        .replace(/_[a-z]/g, (letter) => letter[1].toUpperCase())
      // @ts-expect-error - we know that camelKey is a valid key
      camelObj[camelKey as keyof CamelCase<T>] =
        typeof obj[key] === 'object'
          ? // @ts-expect-error - we know that key is a valid key
            convertToTSStyles(obj[key])
          : obj[key]
    }
  }
  return camelObj
}
