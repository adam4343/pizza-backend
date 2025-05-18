import { cartItemSchema } from '../lib/schemas/cartItemSchema';
import { Router } from "express";
import { db } from "../db"; import { validateSchema } from "../lib/helpers/validateSchema";
import { getErrorMessage } from '../lib/errors/getErrorMessage';
import { authenticateUser } from "../middlewares/auth.middleware";
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { cartItem, cartItemToAdditional, cartItemToIngredients, } from '../db/schemas/cart.schema';
import { getUser } from '../lib/helpers';

export const cartRouter = Router();

cartRouter.post("/", authenticateUser, async (req, res) => {
    try {

        const userId = getUser(req);
        const body = validateSchema(cartItemSchema, req.body);

        const { additionalIngredientsId, ingredientsId } = body

        await db.transaction(async (tx) => {
            const [item] = await tx.insert(cartItem).values({
                pizzaId: body.pizzaId,
                pizzaVariationId: body.pizzaVariationId,
                userId: userId
            }).returning()


            if (additionalIngredientsId?.length) {
                await tx.insert(cartItemToAdditional).values(additionalIngredientsId.map(additionalIngredient => (
                    {
                        additionalIngredientId: additionalIngredient,
                        cartItemId: item.id
                    }
                )))
            }

            await tx.insert(cartItemToIngredients).values(ingredientsId.map(ingredient => ({
                ingredientId: ingredient,
                cartItemId: item.id
            })))
        });

        res.json({ data: "Successfully added product" })
    } catch (e) {
        res.status(400).json({ error: getErrorMessage(e) })
    }
});

cartRouter.get('/', authenticateUser, async (req, res) => {
    try {
        const userId = getUser(req);

        const userCart = await db.query.cartItem.findMany({
            where: eq(cartItem.userId, userId),
            with: {
                pizza: {
                    with: {
                        pizzaToIngredients: true,
                        pizzaToVariations: true
                    }
                },
                pizzaVariation: {
                    columns: {
                        image: true,
                        totalPrice: true,
                        id: true,
                    },
                    with: {
                        pizzaVariationToAttribute: {
                            with: {
                                attribute: true
                            }
                        },
                        pizzaVariationToAdditional: {
                            with : {
                                additionalIngredient: true
                            }
                        }
                    }
                }
            }
        })

        const cartItemsToAdditionalQuery = db.query.cartItemToAdditional.findMany({
            where: inArray(cartItemToAdditional.cartItemId, userCart.map(cartItem => cartItem.id)),
            with: {
                additionalIngredient: true,
            }
        })

        const cartItemsToIngredientsQuery = db.query.cartItemToIngredients.findMany({
            where: inArray(cartItemToIngredients.cartItemId, userCart.map(cartItem => cartItem.id)),
        })

        const [cartItemsToAdditional, cartItemsToIngredients] = await Promise.all([cartItemsToAdditionalQuery, cartItemsToIngredientsQuery])


        res.json({ data: userCart.map(cartItem => ({
            ...cartItem,
            ingredients: cartItemsToIngredients.filter(item => item.cartItemId === cartItem.id),
            additionalIngredients: cartItemsToAdditional.filter(item => item.cartItemId === cartItem.id),
            itemPrice: (cartItemsToAdditional.filter(item => item.cartItemId === cartItem.id).reduce((acc, item) => acc + item.additionalIngredient.price, 0) +  cartItem.pizzaVariation.totalPrice ) * cartItem.quantity,
        }))})
        return

    } catch (e) {
        res.status(400).json({ error: getErrorMessage(e) })
    }
})

cartRouter.delete("/:cartItemId", authenticateUser, async (req, res) => {
    const { cartItemId } = req.params;

    try {

        await db.delete(cartItem).where(eq(cartItem.id, Number(cartItemId)));

        res.json({ data: "Removed item successfully" });
    } catch (e) {
        res.status(400).json({ error: getErrorMessage(e) });
    }
})

cartRouter.put("/:cartItemId", authenticateUser, async (req, res) => {
    const { cartItemId } = req.params;

    //@ts-ignore
    const userId = req.user.id

    try {
        const { quantity } = z.object({
            quantity: z.number().int().positive()
        }).parse(req.body);

        await db.update(cartItem).set({ quantity: quantity }).where(and(eq(cartItem.id, Number(cartItemId)), eq(cartItem.userId, userId)));

        res.json({ message: "Successfully updated quantity" })
    } catch (e) {
        res.status(400).json({ error: getErrorMessage(e) });
    }
})


