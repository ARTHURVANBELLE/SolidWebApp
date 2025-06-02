import { upsertActivity } from "~/lib/activity";
import { APIEvent } from "@solidjs/start/server";
// CORS headers middleware
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Or your specific origins
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ActivityData {
  id?: number;
  title?: string;
  date?: string;
  movingTime?: number;
  distance?: number;
  delegueId?: number;
  description?: string;
  gpxUrl?: string;
  imageUrl?: string[];
  users?: User[];
  comments?: Comment[];
}

interface User {
  // Add user properties as needed
  id: number;
  name: string;
}

interface Comment {
  // Add comment properties as needed
  id: number;
  text: string;
}

// Handle preflight OPTIONS request for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// POST endpoint for creating a new activity
export async function POST({ request }: APIEvent) {
  try {
    // Parse the JSON data from the request
    const activityData = await request.json();
    console.log(
      "Received activity data:",
      JSON.stringify(activityData, null, 2)
    );

    // Convert the JSON data to FormData for compatibility with upsertActivity
    const formData = new FormData();

    // Add basic activity fields
    formData.append("id", activityData.id?.toString() || "0");
    formData.append("title", activityData.title || "");
    formData.append("date", activityData.date || new Date().toISOString());

    // Add optional numeric fields
    if (activityData.movingTime)
      formData.append("movingTime", activityData.movingTime.toString());
    if (activityData.distance)
      formData.append("distance", activityData.distance.toString());
    if (activityData.delegueId)
      formData.append("delegueId", activityData.delegueId.toString());

    // Add optional text fields
    if (activityData.description)
      formData.append("description", activityData.description);
    if (activityData.gpxUrl) formData.append("gpxUrl", activityData.gpxUrl);

    // Add image URLs
    if (Array.isArray(activityData.imageUrl)) {
      activityData.imageUrl.forEach((url: string) => {
        formData.append("imageUrl", url);
      });
    }

    // Add users
    if (Array.isArray(activityData.users)) {
      activityData.users.forEach((user: User) => {
        formData.append("users", JSON.stringify(user));
      });
    }

    // Add comments if they exist
    if (activityData.comments) {
      formData.append("comments", JSON.stringify(activityData.comments));
    }

    // Use the existing upsertActivity function
    const savedActivity = await upsertActivity(formData);

    // Return success response matching frontend expectations
    const response = new Response(
      JSON.stringify({
        success: true,
        activityId: savedActivity.id.toString(),
        message: "Activity created successfully",
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

    return response;
  } catch (error) {
    // Log error details
    console.error("Error creating activity:", error);

    // Return error response matching frontend expectations
    const response = new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

    return response;
  }
}
