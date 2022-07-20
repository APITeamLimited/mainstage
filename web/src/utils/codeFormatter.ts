import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'

type FormatterSupportedLanguage = 'json'

export const codeFormatter = (
  rawBody: string,
  language: FormatterSupportedLanguage
) => {
  switch (language) {
    case 'json':
      return prettier?.format(rawBody, {
        parser: 'json',
        plugins: [parserBabel],
        tabWidth: 4,
      })
    default:
      throw `formatMonacoEditor unsupported language: ${language}`
  }
}
