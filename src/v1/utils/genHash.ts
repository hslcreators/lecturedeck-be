import crypto from 'crypto'
const genHash = (size: number) => {
    return crypto.randomBytes(size).toString('hex')
}
export default genHash