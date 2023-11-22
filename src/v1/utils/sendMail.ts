import { type NextFunction } from 'express'
import nodemailer from 'nodemailer'
const sendMail = async (
  email: string,
  subject: string,
  text: string,
  next: NextFunction
): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS
      }
    })
    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject,
      text
    })
    console.log('email sent sucessfully')
  } catch (err) {
    next(err)
  }
}
export { sendMail }
