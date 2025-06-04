import { db } from "./db";
import { action, query } from "@solidjs/router";
import { z } from "zod";

// Update this interface to match your actual Prisma schema
interface Token {
  id          : number,
  userId      : number,
  jwt         : string,  
  accessToken : string,
}

export const getToken = query(async (stravaId: number) => {
  "use server";
  return db.token.findFirst({
    where: { userId: stravaId },
  });
}, "getTokenByUserId");

// Update the createToken function to match your actual schema
export const addToken = action(async (data: { stravaId: number, jwt: string, accessToken: string }) => {
  "use server";
  return db.token.create({
    data: {
      userId: data.stravaId,
      jwt: data.jwt,
      accessToken: data.accessToken,
    },
  });
}, "createToken");

// Add a function to delete a token (useful for logout functionality)
export const deleteToken = action(async (stravaId: number) => {
  "use server";
  return db.token.deleteMany({
    where: { userId: stravaId },
  });
}, "deleteToken");

