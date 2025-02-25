import { db } from "./db";
import {z} from 'zod'
import {action, query} from "@solidjs/router"

const teamSchema = z.object({
    name: z.string(),
})

type Type = z.infer<typeof teamSchema>

export const getTeams = query(async () => {
    "use server";
    return db.team.findMany();
}, 'getTeams')

export const addTeam = async (formData: FormData) => {
    'use server'
    const newteam = teamSchema.parse({
        name: formData.get('name') as String,
    })

    return db.team.create({ data: { name: newteam.name } })
}

export const addTeamAction = action(async (form: FormData) => {
    'use server'
    await addTeam(form)
}, 'addTeamAction');