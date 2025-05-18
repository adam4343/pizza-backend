// import 'dotenv/config';
// import { defineConfig } from 'drizzle-kit';

// export default defineConfig({
//   out: './drizzle',
//   schema: [
//     "./src/db/schemas/cart.schema.ts",
//     "./src/db/schemas/order.schema.ts",
//     "./src/db/schemas/pizza.schema.ts",
//     "./src/db/schemas/user.schema.ts"
//   ],
//   driver: '',
//   dbCredentials: {
//     url: process.env.TURSO_DATABASE_URL!,
//     authToken: process.env.TURSO_AUTH_TOKEN!,
//   },
// });

import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const authToken = process.env.TURSO_DB_AUTH_TOKEN;

export default defineConfig({
  out: "./drizzle",
  schema: [
         "./src/db/schemas/cart.schema.ts",
         "./src/db/schemas/order.schema.ts",
         "./src/db/schemas/pizza.schema.ts",
         "./src/db/schemas/user.schema.ts"
       ],
  dialect: authToken ? "turso" : "sqlite",
  dbCredentials: {
    url: process.env.TURSO_DB_URL || "file:dev.db",
    authToken: process.env.TURSO_DB_AUTH_TOKEN,
  },
});