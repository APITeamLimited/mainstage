import Inspector from 'inspector-api'

import { checkValue } from './config'

export const configureInspector = () => {
  /*const enableInspector = checkValue<boolean>(
    'entity-engine.inspector.enabled',
    false
  )

  if (!enableInspector) return

  console.log('Enabling inspector')

  const s3AccessKeyID = checkValue<string>(
    'entity-engine.inspector.s3AccessKeyID'
  )
  const s3SecretAccessKey = checkValue<string>(
    'entity-engine.inspector.s3SecretAccessKey'
  )
  const s3EndpointURL = checkValue<string>(
    'entity-engine.inspector.s3EndpointURL'
  )
  const s3BucketName = checkValue<string>(
    'entity-engine.inspector.s3BucketName'
  )

  const s3URL = new URL(s3EndpointURL)

    const inspector = new Inspector({
      storage: {
        type: 's3',
      },
      aws: {
        accessKeyId: s3AccessKeyID,
        secretAccessKey: s3SecretAccessKey,
        region: s3URL.hostname,
        endpoint: s3EndpointURL,
      },

*/
}
