import { db } from "~/lib/db";
import { APIEvent } from "@solidjs/start/server";
import bcrypt from "bcrypt";
import { getUsers, addUserAction } from "~/lib/user";

export async function GET(event: APIEvent) {
  try {
    const users = await getUsers();
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
    const body = await event.request.json();

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = new FormData();
    newUser.append("firstName", body.firstName);
    newUser.append("lastName", body.lastName);
    newUser.append("email", body.email);
    newUser.append("team", body.team);
    newUser.append("password", hashedPassword);

    await addUserAction(newUser);

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
