import { db } from "./db";
import {query} from "@solidjs/router"
import {z} from 'zod'

const userSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    password: z.string().min(8)
})

type Type = z.infer<typeof userSchema>

export const getUsers = query(async () => {
    "use server";
    return db.user.findMany();
}, 'getUsers')

export const addUser = query(async (formData: FormData) => {
    'use server'
    const newuser = userSchema.parse({
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    })

    return db.user.create({ data: newuser})
}, 'addUser')