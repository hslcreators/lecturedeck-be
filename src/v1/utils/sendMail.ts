import nodemailer from 'nodemailer'
// Does not handle errors.
const sendMail = async (
  email: string,
  subject: string,
  html: string,
): Promise<void> => {
    // For Gmail service to work enable 2fa and then create an app password, 
   // this replaces the less secure apps option.
   // https://www.reddit.com/r/node/comments/16rvh9g/how_do_i_send_emails_from_outlook_my_companycom/
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER,
        pass: process.env.PASS
      }
    })
    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject,
      html
    })
    console.log('email sent sucessfully')
}
// sample call
//sendMail('johndoe24@gmail.com', 'Password Reset', `<h1>Lecture Deck</h1> <div> <p> click the link below to reset your password</p> <a href="${process.env.BASE_URL}/password-reset/1234">reset password</a> </div>`);
export { sendMail }
