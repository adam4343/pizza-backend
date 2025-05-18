import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateUniqueId } from "../../lib/helpers";
import { timestamps } from "./pizza.schema";

export const user = sqliteTable("users", {
    id: int().primaryKey().$defaultFn(() => generateUniqueId()),
    name: text().notNull(),
    email: text().notNull().unique(),
    password: text(),
    googleId: text(),
    ...timestamps
})

export const verificationCode = sqliteTable("verificationCodes", {
    id: int().primaryKey().$defaultFn(() => generateUniqueId()),
    token: text().notNull(),
    expiresAt: int({mode: "timestamp"}).notNull(),

    userId: int().notNull().references(() => user.id),

    ...timestamps
})

