import { db } from "./db";
import { z } from "zod";
import { action, redirect, query, reload } from "@solidjs/router";
import bcrypt from "bcrypt";

export const getUsers = query(async () => {
  "use server";
  return db.user.findMany();
}, "getUsers");

export const addUser = async (formData: FormData) => {
  "use server";

  const userSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    teamId: z.coerce.number(),
    password: z
      .string()
      .min(8)
      .transform(async (value) => {
        return await bcrypt.hash(value, 10);
      }),
  });

  const newuser = await userSchema.parseAsync({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    teamId: formData.get('teamId'),
    password: formData.get('password'),
  });

  return db.user.create({ data: newuser });
};

export const addUserAction = action(async (form: FormData) => {
  "use server";
  await addUser(form);
}, "addUserAction");

