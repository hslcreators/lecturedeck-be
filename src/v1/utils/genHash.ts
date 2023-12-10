import crypto from 'crypto'
const genHash = (size: number): string => {
  return crypto.randomBytes(size).toString('hex')
}
export default genHash
