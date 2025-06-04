"use server";

import { Strava } from "arctic";

export const stravaClientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
export const stravaClientSecret = import.meta.env.VITE_STRAVA_CLIENT_SECRET;
export const stravaRedirectUri = import.meta.env.VITE_STRAVA_REDIRECT_URI;

export const strava = new Strava(
  stravaClientId,
  stravaClientSecret,
  stravaRedirectUri
);

/**
 * Creates a Strava authorization URL with the specified parameters
 *
 * @param state A unique state value for CSRF protection
 * @param customRedirectUri Optional custom redirect URI (overrides the default)
 * @returns URL object with the authorization URL
 */
export function createStravaAuthUrl(
  state: string,
  customRedirectUri?: string
): URL {
  // Define the standard set of scopes we need
  const scopes = ["read", "activity:read_all", "profile:read_all"];

  // Use the provided redirect URI or fall back to the default one
  const redirectUri = customRedirectUri || stravaRedirectUri;

  try {
    // Use the Strava instance to create the authorization URL
    return strava.createAuthorizationURL(state, scopes, redirectUri);
  } catch (error) {
    console.error("Error creating Strava authorization URL:", error);
    throw new Error(
      `Failed to create Strava authorization URL: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Validates a Strava authorization code and returns OAuth tokens
 *
 * @param code The authorization code from Strava
 * @returns OAuth tokens
 */
export async function validateStravaCode(code: string) {
  console.log("Validating Strava authorization code");

  try {
    const result = await strava.validateAuthorizationCode(code);
    console.log("Successfully validated code and received tokens");
    return result;
  } catch (error) {
    console.error("Error validating Strava authorization code:", error);
    throw new Error(
      `Strava authentication failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
