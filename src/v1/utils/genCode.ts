import crypto from 'crypto'
const genHash = (): string => {
  return crypto.randomBytes(10).toString('hex')
}
export default genHash
