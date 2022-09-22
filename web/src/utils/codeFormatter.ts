import htmlFormatter from 'html-prettify'
import xmlFormatter from 'xml-formatter'

type FormatterSupportedLanguage = 'json' | 'xml' | 'html' | 'javascript'

export const codeFormatter = async (
  content: string,
  language: FormatterSupportedLanguage
) => {
  const prettier = await import('prettier/standalone')
  const parserBabel = await import('prettier/parser-babel')

  switch (language) {
    case 'json':
      return prettier?.format(content, {
        parser: 'json',
        plugins: [parserBabel],
        tabWidth: 4,
      })
    case 'javascript':
      return prettier?.format(content, {
        parser: 'babel',
        plugins: [parserBabel],
        tabWidth: 4,
      })
    case 'xml':
      return xmlFormatter(content, {
        collapseContent: true,
      })
    case 'html':
      // Incorrect type definition for htmlFormatter
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return htmlFormatter(content, {
        count: 4,
      })
    default:
      throw `codeFormatter unsupported language: ${language}`
  }
}
