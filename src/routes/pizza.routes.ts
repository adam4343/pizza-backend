import { pizzaSchema } from "./../lib/schemas/pizzasSchema";
import { Router } from "express";
import { db } from "../db";
import { z, ZodError } from "zod";
import { getErrorMessage } from "../lib/errors/getErrorMessage";
import { eq, like, sql, ne, and, inArray, gte, lte } from "drizzle-orm";
import { validateSchema } from "../lib/helpers/validateSchema";
import { additionalIngredient, attribute, ingredient, pizza, pizzaToIngredients, pizzaToVariations, pizzaVariation, pizzaVariationToAdditional, pizzaVariationToIngredients } from "../db/schemas/pizza.schema";

export const pizzaRouter = Router();

pizzaRouter.get("/search", async (req, res) => {
  const searchSchema = z.object({
    search: z.string().optional(),
    ingredients: z.array(z.coerce.number()).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().positive().optional(),
    page: z.coerce.number().default(1).optional(),
  });

  try {

    const validatedParams = validateSchema(searchSchema, req.query);

    const search = validatedParams.search ?? "";
    const page = validatedParams.page ?? 1;
    const offset = (page - 1) * 10;
    const ingredients = validatedParams.ingredients ?? [];
    const minPrice = validatedParams.minPrice ?? 0;
    const maxPrice = validatedParams.maxPrice ?? null;
    const searchQuery = `%${search}%`;

    let priceFilteredPizzaIds: number[] | null = null;


    if (minPrice !== 0 || maxPrice !== null) {
      const pizzaVariationsWithPriceFilter = await db
        .select({ pizzaId: pizzaToVariations.pizzaId })
        .from(pizzaToVariations)
        .innerJoin(pizzaVariation,
          sql`${pizzaToVariations.pizzaVariationId} = ${pizzaVariation.id}`)
        .where(
          and(
            minPrice > 0
              ? gte(pizzaVariation.totalPrice, minPrice)
              : undefined,
            maxPrice !== null
              ? lte(pizzaVariation.totalPrice, maxPrice)
              : undefined
          )
        )
        .groupBy(pizzaToVariations.pizzaId);

      priceFilteredPizzaIds = pizzaVariationsWithPriceFilter.map(p => p.pizzaId);

      if (priceFilteredPizzaIds.length === 0) {
        res.json({ data: [] });
        return;
      }
    }

    let ingredientFilteredPizzaIds: number[] | null = null;

    if (ingredients.length > 0) {
      const pizzasWithIngredientFilter = await db
        .select({ pizzaId: pizzaToIngredients.pizzaId })
        .from(pizzaToIngredients)
        .where(inArray(pizzaToIngredients.ingredientId, ingredients))
        .groupBy(pizzaToIngredients.pizzaId)
        .having(
          sql`COUNT(DISTINCT ${pizzaToIngredients.ingredientId}) = ${ingredients.length}`
        );

      ingredientFilteredPizzaIds = pizzasWithIngredientFilter.map(p => p.pizzaId);

      if (ingredientFilteredPizzaIds.length === 0) {
        res.json({ data: [] });
        return;
      }
    }

    const foundProducts = await db.query.pizza.findMany({
      where: and(
        sql`${pizza.name} LIKE ${searchQuery}`,
        priceFilteredPizzaIds !== null
          ? inArray(pizza.id, priceFilteredPizzaIds)
          : undefined,
        ingredientFilteredPizzaIds !== null
          ? inArray(pizza.id, ingredientFilteredPizzaIds)
          : undefined
      ),
      with: {
        pizzaToIngredients: {
          with: {
            ingredient: true,
          }
        },
        pizzaToVariations: {
          with: {
            pizzaVariation: true
          }
        },
      },
      limit: 10,
      offset,
    });

    res.json({ data: foundProducts });
  } catch (e) {
    res.status(400).json({ error: getErrorMessage(e) });
  }
});

pizzaRouter.get("/type", async (req, res) => {
  try {
    const allPizzasTypes = await db.query.pizza.findMany({
      columns: {
        type: true,
      }
    })

    const pizzaTypeCombination = new Map<string, number>()

    allPizzasTypes.forEach((pizza) => {
      const currentCombination = pizzaTypeCombination.get(pizza.type);

      if (currentCombination) {
        pizzaTypeCombination.set(pizza.type, currentCombination + 1)
      } else {
        pizzaTypeCombination.set(pizza.type, 1)
      }
    })


    const pizzaTypes = Object.entries(Object.fromEntries(pizzaTypeCombination)).sort((a, b) => b[1] - a[1]).map(([pizzaType, number]) => pizzaType)

    res.json({ data: pizzaTypes })

  } catch (e) {
    res.status(400).json({ error: getErrorMessage(e) })
  }
})

pizzaRouter.post("/", async (req, res) => {
  try {
    const body = pizzaSchema.safeParse(req.body);

    if (!body.success) {
      throw new ZodError(body.error.issues);
    }

    const data = body.data;
    const createdPizza = await db.transaction(async (tx) => {

      const [createdPizza] = await tx.insert(pizza).values({
        name: data.name,
        type: data.type
      })
        .returning({ id: pizza.id });

      if (data.ingredients.every(ingredient => typeof ingredient === 'number')) {
        await tx.insert(pizzaToIngredients).values(data.ingredients.map((ingredient) => ({
          pizzaId: createdPizza.id,
          ingredientId: ingredient
        })))
      } else {
        await tx.insert(ingredient).values(
          data.ingredients.map((ingredient) => ({
            pizzaVariationId: createdPizza.id,
            name: ingredient.name
          }))
        )
      }

      for await (const variation of data.variations) {
        const [createdPizzaVariation] = await tx
          .insert(pizzaVariation)
          .values({ image: variation.pizzaVariation.image, totalPrice: variation.pizzaVariation.price })
          .returning({ id: pizzaVariation.id });

        if (variation.ingredients.every(x => typeof x === "number")) {
          await tx.insert(pizzaVariationToIngredients).values(
            variation.ingredients.map((ingredient) => ({
              pizzaVariationId: createdPizzaVariation.id,
              ingredientId: ingredient,
            }))
          );
        } else {
          await tx.insert(ingredient).values(
            variation.ingredients.map((ingredient) => ({
              pizzaVariationId: createdPizzaVariation.id,
              ...ingredient
            }))
          )
        }

        if (variation.additionalIngredients.every(ingredient => typeof ingredient === "number")) {
          await db.insert(pizzaVariationToAdditional).values(
            variation.additionalIngredients.map(ingredient => ({
              pizzaVariationId: createdPizzaVariation.id,
              additionalIngredientId: ingredient
            }))
          )
        } else {
          await tx.insert(additionalIngredient).values(
            variation.additionalIngredients.map((ingredient) => ({
              pizzaVariationId: pizzaVariation.id,
              ...ingredient,
            }))
          );
        }

        await tx.insert(attribute).values(
          variation.attributes.map((attribute) => ({
            name: attribute.name,
            type: attribute.type
          }))
        );
      }

      return createdPizza
    });

    res.json({ data: createdPizza });
  } catch (e) {
    res.status(400).json({ error: getErrorMessage(e) });
  }
});

pizzaRouter.get("/", async (req, res) => {
  try {
    const allPizzas = await db.query.pizza.findMany({
      with: {
        pizzaToVariations: {
          with: {
            pizzaVariation: true
          }
        },
        pizzaToIngredients: {
          with: {
            ingredient: true
          }
        }
      }
    });

    res.json({ data: allPizzas });
  } catch (e) {
    res.status(400).json({ error: getErrorMessage(e) });
  }
});

pizzaRouter.get("/ingredients", async (req, res) => {
  try {
    const allIngredients = await db.query.ingredient.findMany();

    res.json({ data: allIngredients })

  } catch (e) {
    res.status(400).json({ error: getErrorMessage(e) })
  }
})

pizzaRouter.get("/:pizzaId", async (req, res) => {
  const { pizzaId } = req.params;
  const id = Number(pizzaId);
  try {
    const foundPizza = await db.query.pizza.findFirst({
      where: eq(pizza.id, id),
      with: {
        pizzaToIngredients: {
          with: {
            ingredient: true,
          }
        },
        pizzaToVariations: {
          with: {
            pizzaVariation: {
              with: {
                pizzaVariationToAdditional: {
                  with: {
                    additionalIngredient: true
                  }
                },
                pizzaVariationToAttribute: {
                  with: {
                    attribute: true
                  }
                },
                pizzaVariationToIngredients: {
                  with: {
                    ingredient: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!foundPizza) {
      throw new Error("The pizza was not found");
    }

    res.json({ data: foundPizza });
  } catch (e) {
    res.status(400).json({ error: getErrorMessage(e) });
  }
});

pizzaRouter.delete("/:pizzaId", async (req, res) => {
  try {
    const { pizzaId } = req.params;

    const id = Number(pizzaId);

    const deletedPizza = await db
      .delete(pizza)
      .where(eq(pizza.id, id))
      .returning();

    if (deletedPizza.length === 0) {
      throw new Error("The pizza was not found");
    }

    res.json({ data: deletedPizza });
  } catch (e) {
    res.status(400).json({ error: getErrorMessage(e) });
  }
});

pizzaRouter.get("/recomended/:pizzaId", async (req, res) => {
  const { pizzaId } = req.params

  const id = Number(pizzaId)

  try {
    const recomendedPizzas = await db.query.pizza.findMany({
      where: ne(pizza.id, id),
      limit: 6,
      with: {
        pizzaToVariations: {
          with: {
            pizzaVariation: true
          }
        },
        pizzaToIngredients: {
          with: {
            ingredient: true
          }
        }
      }
    })
    res.json({ data: recomendedPizzas })
  } catch (e) {
    res.status(400).json({ error: getErrorMessage(e) })
  }
})
