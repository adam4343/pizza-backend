import { int, sqliteTable } from "drizzle-orm/sqlite-core";
import { generateUniqueId } from "../../lib/helpers";
import { pizza, timestamps } from "./pizza.schema";
import { relations } from "drizzle-orm";
import {pizzaVariation, additionalIngredient, ingredient} from "../../db/schemas/pizza.schema"
import { user } from "./user.schema";

export const cartItem = sqliteTable("cartItems", {
  id: int()
    .primaryKey()
    .$defaultFn(() => generateUniqueId()),

  quantity: int().notNull().default(1),

  pizzaId: int()
    .notNull()
    .references(() => pizza.id ),

  pizzaVariationId: int()
    .notNull()
    .references(() => pizzaVariation.id),

  
  userId: int()
    .notNull()
    .references(() => user.id),

  ...timestamps,
})

export const cartItemRelations = relations(cartItem, ({ one, many }) => ({
  pizza: one(pizza, {
    fields: [cartItem.pizzaId],
    references: [pizza.id],
  }),
  pizzaVariation: one(pizzaVariation, {
    fields: [cartItem.pizzaVariationId],
    references: [pizzaVariation.id],
  }),
  user: one(user, {
    fields: [cartItem.userId],
    references: [user.id],
  }),
}));

export const cartItemToAdditional = sqliteTable("cartItemsToAdditional", {
  cartItemId: int()
    .notNull()
    .references(() => cartItem.id, { onDelete : "cascade"}),

  additionalIngredientId: int()
    .notNull()
    .references(() => additionalIngredient.id, { onDelete : "cascade"}),

  ...timestamps,
})

export const cartItemToAdditionalRelations = relations(cartItemToAdditional, ({ one, many }) => ({
  cartItem: one(cartItem, {
    fields: [cartItemToAdditional.cartItemId],
    references: [cartItem.id],
  }),
  additionalIngredient: one(additionalIngredient, {
    fields: [cartItemToAdditional.additionalIngredientId],
    references: [additionalIngredient.id],
  }),
}));

export const cartItemToIngredients = sqliteTable("cartItemsToIngredients", {
  cartItemId: int()
    .notNull()
    .references(() => cartItem.id, { onDelete : "cascade"}),

  ingredientId: int()
    .notNull()
    .references(() => ingredient.id ,  { onDelete : "cascade"}),

  ...timestamps,
})