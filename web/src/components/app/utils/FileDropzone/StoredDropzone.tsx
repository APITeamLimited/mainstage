import { useScopeId, useRawBearer } from 'src/entity-engine/EntityEngine'
import { uploadScopedResource } from 'src/store'

import { FileDropzone, FileDropzoneProps } from './FileDropzone'
import { StoredFileType } from './utils'

export type StoredDropzoneProps = Omit<
  FileDropzoneProps,
  'onFiles' | 'overrideFileName'
> & {
  file: StoredFileType | null
  setFile: (file: StoredFileType | null) => void
}

export const StoredDropzone = ({
  primaryText,
  secondaryMessages,
  accept,
  children,
  file,
  setFile,
  onDelete,
  isSmall,
}: StoredDropzoneProps) => {
  const scopeId = useScopeId()
  const rawBearer = useRawBearer()

  const getStoreReceipt = async (
    data: string | ArrayBuffer,
    filename: string
  ) => {
    if (!scopeId) throw new Error('No scopeId')
    if (!rawBearer) throw new Error('No rawBearer')

    return await uploadScopedResource({
      scopeId,
      rawBearer,
      resource: new Blob([data]),
      resourceName: filename,
    })
  }

  const onFiles = async (files: FileList) => {
    if (files.length === 0) {
      setFile(null)
      return
    }

    const file = files[0]

    const storedObject = await new Promise<StoredFileType>(
      (resolve, reject) => {
        const reader = new FileReader()

        reader.onload = async () => {
          if (!reader.result) {
            reject(new Error('No reader result'))
            return
          }

          resolve({
            data: {
              __typename: 'StoredObject',
              storeReceipt: await getStoreReceipt(reader.result, file.name),
              data: null,
            },
            filename: file.name,
          })
        }

        reader.readAsDataURL(file)
      }
    )

    setFile(storedObject)
  }

  return (
    <FileDropzone
      primaryText={primaryText}
      secondaryMessages={secondaryMessages}
      accept={accept}
      onFiles={onFiles}
      overrideFileName={file?.filename !== undefined ? file.filename : null}
      onDelete={onDelete}
      isSmall={isSmall}
    >
      {children}
    </FileDropzone>
  )
}
