import { db } from "./db";
import {z} from 'zod'
import {action, redirect, query, reload} from "@solidjs/router"

const userSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    teamId: z.number(),
    password: z.string().min(8)
})

type Type = z.infer<typeof userSchema>

export const getUsers = query(async () => {
    "use server";
    return db.user.findMany();
}, 'getUsers')

export const addUser = async (formData: FormData) => {
    'use server'
    
    // Get the teamId from the form and convert it to a number
    const teamIdValue = formData.get('team') || formData.get('teamId');
    const teamId = Number(teamIdValue);
    
    if (isNaN(teamId)) {
        throw new Error("Invalid team ID: must be a number");
    }
    
    const newuser = userSchema.parse({
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        teamId: teamId,
        password: formData.get('password') as string,
    });

    return db.user.create({ data: newuser });
}

export const addUserAction = action(async (form: FormData) => {
    'use server'
    await addUser(form)
}, 'addUserAction');