import { importers } from 'insomnia-importers'

export const importToInsomnia = async (rawText: string) => {
  for (const importer of importers) {
    try {
      const output = await importer.convert(rawText)

      if (output) {
        return {
          output,
          importerName: importer.name,
        }
      }
    } catch (err) {
      // ignore
    }
  }

  return null
}

export const getImporterNames = () => {
  return importers.map((i) => i.name)
}
