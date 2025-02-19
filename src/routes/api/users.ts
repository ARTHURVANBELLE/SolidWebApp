import { db } from "~/lib/db"; // Import your Prisma instance
import { APIEvent } from "@solidjs/start/server";
import bcrypt from "bcrypt";

export async function GET(event: APIEvent) {
  try {
    const users = await db.user.findMany(); // Fetch users from database
    return new Response(JSON.stringify(users), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json(); // Parse JSON request body

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = await db.user.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: hashedPassword, // Store hashed password
      },
    });

    return new Response(JSON.stringify(newUser), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create user" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
