import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: [
    "./src/db/schemas/cart.schema.ts",
    "./src/db/schemas/order.schema.ts",
    "./src/db/schemas/pizza.schema.ts",
    "./src/db/schemas/user.schema.ts"
  ],
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
});