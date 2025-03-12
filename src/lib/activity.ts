import { action } from "@solidjs/router";
import { db } from "./db";

export async function addActivity(activityName: string) {
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
    console.log("addActivityAction:", addActivityAction);
}, 'addActivityAction');