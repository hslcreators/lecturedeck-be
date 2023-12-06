import jwt from 'jsonwebtoken';
import 'dotenv/config';
const maxAge = 5 * 24 * 60 * 60;
const createToken = (tokenData:Record<string, string>): string =>{
  return  jwt.sign(tokenData, process.env.JWT_SECRET as string,{
        expiresIn: maxAge
    })
};
export default createToken;