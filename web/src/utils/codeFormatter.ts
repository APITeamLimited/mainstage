import htmlFormatter from 'html-prettify'
import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import xmlFormatter from 'xml-formatter'

type FormatterSupportedLanguage = 'json' | 'xml' | 'html'

export const codeFormatter = (
  content: string,
  language: FormatterSupportedLanguage
) => {
  switch (language) {
    case 'json':
      return prettier?.format(content, {
        parser: 'json',
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
