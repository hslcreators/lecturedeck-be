import {z} from 'zod'
const signup = z.object({
    email: z.string().email(),
    password: z.string().min(8, {message:'the minimium length of password is 8'}).max(255),
    username: z.string().min(5).max(255)
})

type Signup = z.infer<typeof signup>
export {
    signup,
    type Signup
}
