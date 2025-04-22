import { db } from "./db";
import { z } from "zod";
import { action, query } from "@solidjs/router";
import bcrypt from "bcrypt";

export const getUsers = query(async () => {
  "use server";
  return db.user.findMany();
}, "getUsers");

export const getUserById = query(async (id: number) => {
  "use server";
  return db.user.findUnique({
    where: { stravaId: id },
  });
}, "getUserById");

export const getUsersByTeam = query(async (teamId: number) => {
  "use server";
  return db.user.findMany({
    where: { teamId },
  });
}, "getUsersByTeam");

export const updateUser = async (formData: FormData) => {
  "use server";

  const userSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    teamId: z.coerce.number(),
    imageUrl: z.string().optional(),
    stravaId: z.coerce.number(),  // Ensure stravaId is required and unique
    isAdmin: z.coerce.boolean().optional(),
    password: z
      .string()
      .min(8)
      .transform(async (value) => {
        return await bcrypt.hash(value, 10);
      }),
  });

  const updatedUser = await userSchema.parseAsync({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    teamId: formData.get("teamId"),
    password: formData.get("password"),
    imageUrl: formData.get("imageUrl"),
    stravaId: formData.get("stravaId"),
    isAdmin: formData.get("isAdmin") === "on",
  });

  // Find the user by stravaId
  const existingUser = await db.user.findUnique({
    where: { stravaId: updatedUser.stravaId },
  });

  if (!existingUser) {
    throw new Error("User with the given Strava ID not found.");
  }

  return db.user.update({
    where: { stravaId: updatedUser.stravaId },
    data: updatedUser,
  });
};

export const updateUserAction = action(async (form: FormData) => {
  "use server";
  return await updateUser(form);
}, "updateUserAction");

