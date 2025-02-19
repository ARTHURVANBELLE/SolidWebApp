import { action, redirect } from "@solidjs/router";
import { db } from "./db";

async function addActivity(activityName: string) {
    'use server'
    return db.activity.create({
        data: {
            title: activityName,
        },
    });
}

export const addActivityAction = action(async (form: FormData) => {
    'use server'
    await addActivity(form.get("title") as string);
    throw redirect("/member-selection")
}, 'addActivityAction');