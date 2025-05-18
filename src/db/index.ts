import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import * as cartSchema from "./schemas/cart.schema";
import * as userSchema from "./schemas/user.schema";
import * as pizzaSchema from "./schemas/pizza.schema";
import * as orderSchema from "./schemas/order.schema";

export const db = drizzle(process.env.DB_FILE_NAME!, {
    schema: {
        ...cartSchema,
        ...userSchema,
        ...pizzaSchema,
        ...orderSchema
    }
});
