import { StoredObject } from '@apiteam/types'

export type StoredFileType = {
  data: StoredObject<string | ArrayBuffer>
  filename: string
}

export type UnpackedFile = {
  data: string | ArrayBuffer
  filename: string
}

export const unpackFilelist = async (files: FileList) => {
  if (files.length === 0) {
    return []
  }

  return await Promise.all(
    Array.from(files).map((file) => {
      return new Promise<UnpackedFile>((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = async () => {
          if (!reader.result) {
            reject(new Error('No reader result'))
            return
          }

          resolve({
            data: reader.result,
            filename: file.name,
          })
        }

        reader.readAsDataURL(file)
      })
    })
  )
}
