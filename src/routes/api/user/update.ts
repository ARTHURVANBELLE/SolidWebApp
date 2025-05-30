import { type APIEvent } from "@solidjs/start/server";
import { updateUser } from "~/lib/user";
import { applyCors, handleCorsPreflightRequest } from "~/utils/cors";
import { strava } from "~/utils/strava";


export function OPTIONS(event: APIEvent) {
  return handleCorsPreflightRequest(event);
}

export async function POST(event: APIEvent) {
  // Apply CORS headers
  const response = applyCors(event,new Response());
  
  try {
    // Try to get JSON data first
    let userData: Record<string, any>;
    let stravaId: string | undefined;
    
    try {
      // Attempt to parse JSON data
      const jsonData = await event.request.json();
      console.log("Received JSON data:", jsonData);
      userData = jsonData;
      stravaId = userData.stravaId?.toString();
    } catch (e) {
      // If JSON parsing fails, try form data
      const formData = await event.request.formData();
      stravaId = formData.get("stravaId")?.toString();
      
      // Add userId to userData object
      userData = { stravaId };
      
      // Extract other fields from form data
      [
        "email", "firstName", "lastName", "imageUrl", "isAdmin", 
        "password", "accessToken", "refreshToken", "stravaId", "teamId"
      ].forEach(field => {
        const value = formData.get(field)?.toString();
        if (value) {
          // Convert boolean string to actual boolean for isAdmin
          if (field === "isAdmin") {
            userData[field] = value.toLowerCase() === "true";
          }
          // Convert numeric fields to numbers
          else if (field === "stravaId" || field === "teamId") {
            userData[field] = parseInt(value, 10);
          }
          // Keep other fields as strings
          else {
            userData[field] = value;
          }
        }
      });
    }
    
    if (!stravaId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), { 
        status: 400,
        headers: response.headers
      });
    }

    console.log("Updating user with data:", userData);
    
    // Create a FormData instance and append userData values
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value));
    });
    
    // Update the user in the database
    const updatedUser = await updateUser(formData);
    
    if (!updatedUser) {
      return new Response(JSON.stringify({ error: "User not found" }), { 
        status: 404,
        headers: response.headers
      });
    }
    
    return new Response(JSON.stringify({ user: updatedUser }), {
      headers: response.headers
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return new Response(JSON.stringify({ error: "Failed to update user", details: String(error) }), { 
      status: 500,
      headers: response.headers
    });
  }
}
