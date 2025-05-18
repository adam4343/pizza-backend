import { check, int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateUniqueId } from "../../lib/helpers";
import { relations, sql } from "drizzle-orm";


export const timestamps = {
    createdAt: int({ mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
    updatedAt: int({ mode: "timestamp" }).$onUpdate(() => new Date()).$defaultFn(() => new Date()).notNull()
}

export const pizza = sqliteTable("pizzas", {
    id: int().primaryKey().$defaultFn(() => generateUniqueId()),
    name: text().notNull(),
    type: text().notNull(),
    ...timestamps
})

export const pizzaRelations = relations(pizza, ({ many }) => ({
    pizzaToVariations: many(pizzaToVariations),
    pizzaToIngredients: many(pizzaToIngredients)
}))

export const pizzaVariation = sqliteTable("pizzaVariations", {
    id: int().primaryKey().$defaultFn(() => generateUniqueId()),
    image: text().notNull(),
    totalPrice: real().notNull(),

    ...timestamps

}, (table) => [
    check("total_price_check", sql`${table.totalPrice} > 0`)
])

export const pizzaVariationRelations = relations(pizzaVariation, ({ many }) => ({
    pizzaToVariations: many(pizzaToVariations),
    pizzaVariationToIngredients: many(pizzaVariationToIngredients),
    pizzaVariationToAdditional: many(pizzaVariationToAdditional),
    pizzaVariationToAttribute: many(pizzaVariationToAttribute)
}))

// Ingredients
export const ingredient = sqliteTable("ingredients", {
    id: int().primaryKey().$defaultFn(() => generateUniqueId()),
    name: text().notNull(),
    isRemovable: int({ mode: "boolean" }).default(false),


    ...timestamps
})

export const ingredientRelations = relations(ingredient, ({ many }) => ({
    pizzaToIngredients: many(pizzaToIngredients),
    pizzaVariationToIngredients: many(pizzaVariationToIngredients),
}))

//Additional Ingredients 
export const additionalIngredient = sqliteTable("additionalIngredients", {
    id: int().primaryKey().$defaultFn(() => generateUniqueId()),
    image: text().notNull(),
    name: text().notNull(),
    price: real().notNull()
}, (table) => [
    check("price_check", sql`${table.price} > 0`)
])


// Attributes
export const attribute = sqliteTable("attributes", {
    id: int().primaryKey().$defaultFn(() => generateUniqueId()),
    type: text().notNull(),
    name: text().notNull(),
})

export const attributeRelations = relations(attribute, ({ many }) => ({
    pizzaVariationToAttribute: many(pizzaVariationToAttribute)
}))

// Many to many
export const pizzaToVariations = sqliteTable("pizzasToVariations", {
    pizzaId: int().notNull().references(() => pizza.id),
    pizzaVariationId: int().notNull().references(() => pizzaVariation.id),
})

export const pizzaToIngredients = sqliteTable('pizzasToIngredient', {
    pizzaId: int().notNull().references(() => pizza.id),
    ingredientId: int().references(() => ingredient.id)
})

export const pizzaVariationToIngredients = sqliteTable("pizzaVariationsToIngredients", {
    pizzaVariationId: int().notNull().references(() => pizzaVariation.id),
    ingredientId: int().notNull().references(() => ingredient.id)
})

export const pizzaVariationToAdditional = sqliteTable("pizzaVariationsToAdditionals", {
    pizzaVariationId: int().notNull().references(() => pizzaVariation.id),
    additionalIngredientId: int().notNull().references(() => additionalIngredient.id)
})

export const pizzaVariationToAttribute = sqliteTable("pizzaVariationsToAttributes", {
    pizzaVariationId: int().references(() => pizzaVariation.id),
    attributeId: int().references(() => attribute.id)
})

export const additionalIngredientRelations = relations(additionalIngredient, ({ many }) => ({
  pizzaVariationToAdditional: many(pizzaVariationToAdditional)
}));

export const pizzaToVariationsRelations = relations(pizzaToVariations, ({ one }) => ({
  pizza: one(pizza, {
    fields: [pizzaToVariations.pizzaId],
    references: [pizza.id]
  }),
  pizzaVariation: one(pizzaVariation, {
    fields: [pizzaToVariations.pizzaVariationId],
    references: [pizzaVariation.id]
  })
}));

export const pizzaVariationToAdditionalRelations = relations(pizzaVariationToAdditional, ({ one }) => ({
    pizzaVariation: one(pizzaVariation, {
      fields: [pizzaVariationToAdditional.pizzaVariationId],
      references: [pizzaVariation.id]
    }),
    additionalIngredient: one(additionalIngredient, {
      fields: [pizzaVariationToAdditional.additionalIngredientId],
      references: [additionalIngredient.id]
    })
  }));

export const pizzaVariationToAttributeRelations = relations(pizzaVariationToAttribute, ({ one }) => ({
  pizzaVariation: one(pizzaVariation, {
    fields: [pizzaVariationToAttribute.pizzaVariationId],
    references: [pizzaVariation.id]
  }),
  attribute: one(attribute, {
    fields: [pizzaVariationToAttribute.attributeId],
    references: [attribute.id]
  })
}));

export const pizzaVariationToIngredientsRelations = relations(pizzaVariationToIngredients, ({ one }) => ({
    pizzaVariation: one(pizzaVariation, {
      fields: [pizzaVariationToIngredients.pizzaVariationId],
      references: [pizzaVariation.id]
    }),
    ingredient: one(ingredient, {
      fields: [pizzaVariationToIngredients.ingredientId],
      references: [ingredient.id]
    })
  }));


export const pizzaToIngredientsRelations = relations(pizzaToIngredients, ({ one }) => ({
  pizza: one(pizza, {
    fields: [pizzaToIngredients.pizzaId],
    references: [pizza.id]
  }),
  ingredient: one(ingredient, {
    fields: [pizzaToIngredients.ingredientId],
    references: [ingredient.id]
  })
}));    