import { action } from "@solidjs/router";
import { db } from "./db";
import { nullable, z } from "zod";

export const upsertActivity = async (formData: FormData) => {
  "use server";

  console.log("upsertActivity 1 :", formData);

  const imageUrlSchema = z.object({
    url: z.string(),
    activityId: z.number(),
  });

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
    imageUrl: formData.getAll("imageUrl").map(url => ({ url: url.toString() })),
    users: formData.getAll("users")
      .filter(userId => {
        // Filter out empty strings, null, and undefined values
        const value = userId?.toString().trim();
        return value !== null && value !== undefined && value !== '';
      })
      .map(userId => {
        // Try to parse the value, which could be a JSON string
        try {
          const userObj = JSON.parse(userId.toString());
          const id = parseInt(userObj.userId || userObj.id);
          return { userId: isNaN(id) ? undefined : id }; // Skip NaN values
        } catch (e) {
          // If not JSON, try to parse directly as number
          const id = parseInt(userId.toString());
          return { userId: isNaN(id) ? undefined : id }; // Skip NaN values
        }
      })
      .filter(user => user.userId !== undefined), // Remove objects with undefined userId
    comments: (() => {
      const commentsValue = formData.get("comments");
      if (!commentsValue) return undefined;
      
      try {
        // Try to parse comments as JSON array
        const parsedComments = JSON.parse(commentsValue.toString());
        return Array.isArray(parsedComments) ? parsedComments : [];
      } catch (e) {
        // If parsing fails, return empty array
        return [];
      }
    })(),
  });

  const activityInfo = activitySchema.parse(updatedActivity);
  
  console.log("upsertActivity 2 :", activityInfo);

  return db.activity.upsert({
    where: { id: parseInt(activityInfo.id) },
    update: {
      title: activityInfo.title,
      datetime: activityInfo.date,
      description: activityInfo.description,
      gpxUrl: activityInfo.gpxUrl,
      imageUrl: {
        deleteMany: {}, // Remove existing images
        create: activityInfo.imageUrl.map(img => ({ url: img.url })), // Add new images
      },
      users: {
        create: activityInfo.users,
      },
    },
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
