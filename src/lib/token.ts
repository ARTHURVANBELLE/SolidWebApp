import { db } from "./db";
import { action, query } from "@solidjs/router";
import { z } from "zod";

// Update this interface to match your actual Prisma schema
export interface TokenInterface {
  id?          : number,
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


export const deleteToken = async (stravaId: number) => {
  "use server";
  return db.token.delete({
    where: { userId: stravaId },
  });
}

/**
 * Direct database function to upsert a token without using FormData
 * This is useful for server-side operations where FormData isn't available
 */
export const upsertToken = async ({ stravaId, jwt, accessToken }: {
  stravaId: number,
  jwt: string,
  accessToken: string
}) => {
  "use server";
  
  try {
    const result = await db.token.upsert({
      where: { userId: stravaId },
      update: {
        jwt: jwt,
        accessToken: accessToken,
      },
      create: {
        userId: stravaId,
        jwt: jwt,
        accessToken: accessToken,
      },
    });
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Token upsert error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

