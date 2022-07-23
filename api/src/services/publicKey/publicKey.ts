import { getKeyPair } from '../bearer/bearer'

export async function publicKey(): Promise<string> {
  return await getKeyPair().then((keyPair) => keyPair.publicKey)
}
