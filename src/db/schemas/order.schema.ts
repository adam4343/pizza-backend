import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateUniqueId } from "../../lib/helpers";
import { additionalIngredient, ingredient, pizza, pizzaVariation, timestamps } from "./pizza.schema";
import { user } from "./user.schema";
import { relations } from "drizzle-orm";

export const order = sqliteTable("orders", {
    id: int()
      .primaryKey()
      .$defaultFn(() => generateUniqueId()),
  
    additionalNotes: text(),
    name: text().notNull(),
    surname: text().notNull(),
    email: text().notNull(),
    phone: text().notNull(),
    timeOfDelivery: int({ mode: "timestamp" }).notNull(),
    totalPrice: int().notNull(),
    status: text({ enum: ["pending", "processing", "delivered", "cancelled"] }).notNull(),
  
    userId: int()
      .notNull()
      .references(() => user.id),
  
    ...timestamps,
  })

  export const orderRelations = relations(order, ({one,many}) => ({
    orderItem: many(orderItem),
    user: one(user, {
      fields: [order.userId],
      references: [user.id]
    })
  }))
  
  export const orderItem = sqliteTable("orderItems", {
    id: int()
      .primaryKey()
      .$defaultFn(() => generateUniqueId()),
  
    quantity: int().notNull().default(1),
  
    pizzaId: int()
      .notNull()
      .references(() => pizza.id),
  
    pizzaVariationId: int()
      .notNull()
      .references(() => pizzaVariation.id),
  
    userId: int()
      .notNull()
      .references(() => user.id),
  
    orderId: int().notNull().references(() => order.id),
  
    ...timestamps,
  })
  
  export const orderItemRelations = relations(orderItem, ({ one, many }) => ({
    pizza: one(pizza, {
      fields: [orderItem.pizzaId],
      references: [pizza.id],
    }),
    pizzaVariation: one(pizzaVariation, {
      fields: [orderItem.pizzaVariationId],
      references: [pizzaVariation.id],
    }),
    user: one(user, {
      fields: [orderItem.userId],
      references: [user.id],
    }),
    order: one(order, {
      fields: [orderItem.orderId],
      references: [order.id]
    })
  }));
  
  export const address = sqliteTable("adresses", {
    id: int()
      .primaryKey()
      .$defaultFn(() => generateUniqueId()),
  
    city: text().notNull(),
    zipcode: text().notNull(),
    address: text().notNull(),
  
    orderId: int().notNull().references(() => order.id),
  })
  
  export const orderItemToIngredient = sqliteTable("orderItemsToIngredients", {
    orderItemId: int()
      .notNull()
      .references(() => orderItem.id),
  
    ingredientId: int()
      .notNull()
      .references(() => ingredient.id),
  
    ...timestamps,
  })

  export const orderItemToAdditional = sqliteTable("orderItemsToAdditional", {
    orderItemId: int()
      .notNull()
      .references(() => orderItem.id),
  
    additionalIngredientId: int()
      .notNull()
      .references(() => additionalIngredient.id),
  
    ...timestamps,
  })