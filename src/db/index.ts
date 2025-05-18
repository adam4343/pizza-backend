import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import * as cartSchema from "./schemas/cart.schema";
import * as userSchema from "./schemas/user.schema";
import * as pizzaSchema from "./schemas/pizza.schema";
import * as orderSchema from "./schemas/order.schema";
import { createClient } from '@libsql/client';

export const tursoClient = createClient({
  url: process.env.TURSO_DB_URL!, 
  authToken: process.env.TURSO_DB_AUTH_TOKEN, 
});

export const db = drizzle(tursoClient, { schema: {
    ...cartSchema,
    ...userSchema,
    ...pizzaSchema,
    ...orderSchema
} });