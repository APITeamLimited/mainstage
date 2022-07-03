import md5 from 'md5'
import { v4 as uuidv4 } from 'uuid'

export const generateResetToken = () => {
  const token = md5(uuidv4())
  const buffer = Buffer.from(token, 'base64')
  return buffer.toString('base64').replace('=', '').substring(0, 16)
}
