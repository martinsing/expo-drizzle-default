import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./db/schema.ts", // Path to the schema file
  out: "./drizzle", // Output directory for migrations
  dialect: "sqlite", // Database dialect
  driver: "expo", // Driver for the database
});
