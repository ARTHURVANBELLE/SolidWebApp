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
