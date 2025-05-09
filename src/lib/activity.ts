import { action } from "@solidjs/router";
import { db } from "./db";
import { nullable, z } from "zod";

export const upsertActivity = async (formData: FormData) => {
  "use server";

  console.log("upsertActivity 1 :", formData);

  const activitySchema = z.object({
    id: z.string(),
    title: z.string(),
    date: z.string(),
    description: z.string().nullable().optional(),
    gpxUrl: z.string().nullable().optional(),
    imageUrl: z.array(z.object({ url: z.string() })),
    users: z.array(z.object({ userId: z.number() })),
    comments: z
      .array(
        z.object({
          id: z.number(),
          content: z.string(),
          userId: z.number(),
        })
      )
      .optional(),
  });

  const updatedActivity = await activitySchema.parseAsync({
    id: formData.get("id")?.toString(),
    title: formData.get("title"),
    date: formData.get("date"),
    description: formData.get("description"),
    gpxUrl: formData.get("gpxUrl"),
    imageUrl: formData.get("imageUrl"),
    users: formData.getAll("users"),
    comments: formData.get("comments"),
  });

  const activityInfo = activitySchema.parse(updatedActivity);

  console.log("upsertActivity 2 :", activityInfo);

  return db.activity.upsert({
    where: { id: parseInt(activityInfo.id)},
    update: {},
    create: {
      id: parseInt(activityInfo.id),
      title: activityInfo.title,
      datetime: activityInfo.date,
      description: activityInfo.description,
      gpxUrl: activityInfo.gpxUrl,
      imageUrl: {
        create: activityInfo.imageUrl,
      },
      users: {
        create: activityInfo.users,
      },
      comments: activityInfo.comments
        ? {
            create: activityInfo.comments.map((comment) => ({
              text: comment.content,
              userId: comment.userId,
            })),
          }
        : undefined,
    },
  });
};

export const upsertActivityAction = action(async (form: FormData) => {
  "use server";
  await upsertActivity(form);
  console.log("addActivityAction:", upsertActivity(form));
}, "addActivityAction");
