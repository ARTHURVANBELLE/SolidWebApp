import { action } from "@solidjs/router";
import { db } from "./db";
import { nullable, z } from "zod";

export type ActivityWithUsers = {
  id: number;
  title: string;
  datetime: string | Date;
  movingTime : number;
  distance: number;
  delegueId: number;
  description: string | null;
  gpxUrl: string | null;
  imageUrl: string[];
  users: { userId: number }[];
};

export const upsertActivity = async (formData: FormData) => {
  "use server";

  const imageUrlSchema = z.object({
    url: z.string(),
    activityId: z.number(),
  });

  console.log("Form Data:", formData);
  console.log("Users in form:", formData.getAll("users"));

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
        console.log("User value before filtering:", value);
        return value !== null && value !== undefined && value !== '';
      })
      .map(userId => {
        console.log("Processing user:", userId.toString());
        // Try to parse the value, which could be a JSON string
        try {
          const userIdStr = userId.toString().trim();
          
          // First try to parse as JSON
          if (userIdStr.startsWith('{') && userIdStr.endsWith('}')) {
            const userObj = JSON.parse(userIdStr);
            console.log("Parsed user object:", userObj);
            const id = parseInt(userObj.userId || userObj.id);
            console.log("User ID after parsing JSON:", id);
            return { userId: isNaN(id) ? undefined : id };
          } else {
            // If not JSON format, parse directly as number
            const id = parseInt(userIdStr);
            console.log("User ID after direct parsing:", id);
            return { userId: isNaN(id) ? undefined : id };
          }
        } catch (e) {
          console.log("Parsing failed:", e);
          // If all parsing fails, try direct number parsing as fallback
          const id = parseInt(userId.toString());
          console.log("Fallback - User ID after direct parsing:", id);
          return { userId: isNaN(id) ? undefined : id };
        }
      })
      .filter(user => {
        console.log("User object after mapping:", user);
        return user.userId !== undefined;
      }),
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

  console.log("Parsed Activity Info:", activityInfo);
  console.log("Users after parsing:", activityInfo.users);
  
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
        deleteMany: {}, // Remove existing user connections
        create: activityInfo.users, // Add new user connections
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

export const getActivities = async (activityNumber: number): Promise<ActivityWithUsers[]> => {
  "use server";

  const activities = await db.activity.findMany({
    orderBy: {
      datetime: "desc",
    },
    take: activityNumber,
    include: {
      imageUrl: true,
      users: true,
    },
  });
  return activities.map((activity) => ({
    id: Number(activity.id),
    title: activity.title,
    datetime: activity.datetime,
    movingTime: activity.movingTime ?? 0,
    distance: activity.distance ?? 0,
    delegueId: activity.delegueId ?? 0,
    description: activity.description,
    gpxUrl: activity.gpxUrl,
    imageUrl: activity.imageUrl.map((img) => img.url),
    users: activity.users.map((user) => ({
      userId: typeof user.userId === 'bigint' ? Number(user.userId) : user.userId
    })),
  }));
}

export const upsertActivityAction = action(async (form: FormData) => {
  "use server";
  await upsertActivity(form);
}, "addActivityAction");

export const getActivitiesAction = action(async (activityNumber: number): Promise<ActivityWithUsers[]> => {
  "use server";
  return await getActivities(activityNumber);
}, "getActivitiesAction");