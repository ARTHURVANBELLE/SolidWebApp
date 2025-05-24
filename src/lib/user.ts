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

export const addUser = async (formData: FormData) => {
  "use server";
  const userSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    teamId: z.coerce.number(),
    imageUrl: z.string().optional(),
    stravaId: z.coerce.number(),
    isAdmin: z.coerce.boolean().optional(),
    accessToken: z.string().optional(),
    password: z
      .string()
      .min(8)
      .transform(async (value) => {
        return await bcrypt.hash(value, 10);
      }),
  });
  const newUser = await userSchema.parseAsync({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    teamId: formData.get("teamId"),
    password: formData.get("password"),
    imageUrl: formData.get("imageUrl"),
    stravaId: formData.get("stravaId"),
    accessToken: formData.get("accessToken"),
    isAdmin: formData.get("isAdmin") === "on",
  });
  // Check if the user already exists
  const existingUser = await db.user.findUnique({
    where: { stravaId: newUser.stravaId },
  });
  if (existingUser) {
    throw new Error("User with the given Strava ID already exists.");
  }
  return db.user.create({
    data: newUser,
  });
};

export const updateUser = async (formData: FormData) => {
  "use server";
  // Parse and validate the incoming data
  const userSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    teamId: z.coerce.number().optional(),
    imageUrl: z.string().optional(),
    stravaId: z.coerce.number(),
    isAdmin: z.coerce.boolean().optional(),
    accessToken: z.string().optional(),
    password: z
      .string()
      .min(8)
      .transform(async (value) => {
        return await bcrypt.hash(value, 10);
      })
      .optional(),
  });

  // Prepare update data object, omitting empty fields
  const updateData: Record<string, any> = {};

  // Only include non-empty fields
  if (formData.get("firstName")?.toString().trim()) {
    updateData.firstName = formData.get("firstName")?.toString().trim();
  }

  if (formData.get("lastName")?.toString().trim()) {
    updateData.lastName = formData.get("lastName")?.toString().trim();
  }

  if (formData.get("email")?.toString().trim()) {
    updateData.email = formData.get("email")?.toString().trim();
  }

  if (formData.get("teamId")?.toString().trim()) {
    updateData.teamId = Number(formData.get("teamId"));
  }

  if (formData.get("imageUrl")?.toString().trim()) {
    updateData.imageUrl = formData.get("imageUrl")?.toString().trim();
  }

  if (formData.get("accessToken")?.toString().trim()) {
    updateData.accessToken = formData.get("accessToken")?.toString().trim();
  }

  // Handle password specially since it requires hashing
  if (formData.get("password")?.toString().trim()) {
    updateData.password = await bcrypt.hash(
      formData.get("password")!.toString(),
      10
    );
  }

  // Handle isAdmin checkbox
  const isAdminValue = formData.get("isAdmin");
  if (isAdminValue !== null) {
    updateData.isAdmin = isAdminValue === "on" || isAdminValue === "true";
  }

  // Ensure we have the stravaId for the WHERE clause
  const stravaId = Number(formData.get("stravaId"));
  if (isNaN(stravaId)) {
    throw new Error("Strava ID is required and must be a number");
  }

  // Validate the data that we're actually updating
  const validatedData = await userSchema.parseAsync({
    ...updateData,
    stravaId, // Always include stravaId for validation
  });

  // Find the user by stravaId
  const existingUser = await db.user.findUnique({
    where: { stravaId },
  });

  if (!existingUser) {
    throw new Error("User with the given Strava ID not found.");
  }

  // Only update with the non-empty fields
  return db.user.update({
    where: { stravaId },
    data: updateData,
  });
};

export const getTopUsers = query(async (limit: number) => {
  "use server";
  return db.user.findMany({
    select: {
      stravaId: true,
      firstName: true,
      lastName: true,
      email: true,
      imageUrl: true,
      teamId: true,
      isAdmin: true,
      _count: {
        select: { activities: true }  // This adds the count of activities
      },
      activities: {
        select: { activityId: true }  // Include minimal activity info if needed
      }
    },
    orderBy: {
      activities: {
        _count: "desc",
      },
    },
    take: limit,
  });
}, "getTopUsers");

export const updateUserAction = action(async (form: FormData) => {
  "use server";
  return await updateUser(form);
}, "updateUserAction");

export const addUserAction = action(async (form: FormData) => {
  "use server";
  return await addUser(form);
}, "addUserAction");
