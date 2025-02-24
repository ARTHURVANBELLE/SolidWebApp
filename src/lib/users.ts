import { db } from "./db";
import {z} from 'zod'
import {action, redirect, query, reload} from "@solidjs/router"

const userSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    team: z.string(),
    password: z.string().min(8)
})

type Type = z.infer<typeof userSchema>

export const getUsers = query(async () => {
    "use server";
    return db.user.findMany();
}, 'getUsers')

export const addUser = async (formData: FormData) => {
    //'use server'
    const newuser = userSchema.parse({
        firstName: formData.get('firstName') as String,
        lastName: formData.get('lastName') as String,
        email: formData.get('email') as String,
        team: formData.get('team') as String,
        password: formData.get('password') as String,
    })

    return db.user.create({ data: newuser})
}

export const addUserAction = action(async (form: FormData) => {
    'use server'
    await addUser(form)
}, 'addUserAction');