// db/logic.ts
import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";

const expo = SQLite.openDatabaseSync("db.db", { enableChangeListener: true });
const db = drizzle(expo);

// Database logic is kept in this file to keep the other files clean

// Checks to see if there is any data in database with a count in userList
export async function checkDatabaseState() {
  try {
    const count = await db.$count(usersTable);
    console.log(`Current users in the database: ${count}`);
  } catch (error) {
    console.error("Error checking database state:", error);
  }
}

// Reads all Users in userList
export async function getAllUsers() {
  try {
    const users = await db.select().from(usersTable);
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// Reads User by ID in updateUser
export async function getUserById(id: string) {
  try {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));
    return users[0] || null; // Return the first user or null
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}

// Updates Current User in updateUser
export async function updateUser(
  id: string,
  data: { name: string; email: string }
) {
  try {
    await db.update(usersTable).set(data).where(eq(usersTable.id, id));
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

// Deletes Current User in in updateUser
export async function deleteUser(id: string) {
  try {
    await db.delete(usersTable).where(eq(usersTable.id, id));
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
