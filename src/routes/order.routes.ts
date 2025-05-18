import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware";
import { validateSchema } from "../lib/helpers/validateSchema";
import { orderSchema } from "../lib/schemas/orderSchema";
import { db } from "../db";
import { and, eq } from "drizzle-orm";
import { cartItem } from "../db/schemas/cart.schema";
import {
    order,
    orderItem,
    orderItemToAdditional,
    orderItemToIngredient,
} from "../db/schemas/order.schema";
import { getErrorMessage } from "../lib/errors/getErrorMessage";
import { z } from "zod";
import { getUser } from "../lib/helpers";
export const orderRouter = Router();

orderRouter.post("/", authenticateUser, async (req, res) => {
    const userId = getUser(req);

    try {
        const body = validateSchema(orderSchema, req.body);

        const allCartItems = await db.query.cartItem.findMany({
            where: eq(cartItem.userId, userId),
            with: {
                pizzaVariation: {
                    with: {
                        pizzaVariationToAdditional: true,
                        pizzaVariationToIngredients: true,
                    },
                },
            },
        });

        await db.transaction(async (tx) => {
            if (allCartItems.length === 0) {
                throw new Error("Cart is empty");
            }
        
            const [newOrder] = await tx
                .insert(order)
                .values({
                    email: body.email,
                    name: body.name,
                    phone: body.phone,
                    status: "pending",
                    surname: body.surname,
                    timeOfDelivery: body.timeOfDelivery,
                    totalPrice: body.totalPrice,
                    userId: userId,
                })
                .returning();
        
            for (const cartItem of allCartItems) {
                const [createdOrderItem] = await tx
                    .insert(orderItem)
                    .values({
                        pizzaId: cartItem.pizzaId,
                        pizzaVariationId: cartItem.pizzaVariationId,
                        userId: userId,
                        orderId: newOrder.id,
                        quantity: cartItem.quantity
                    })
                    .returning();
        
                await tx.insert(orderItemToIngredient).values(
                    cartItem.pizzaVariation.pizzaVariationToIngredients.map(
                        (ingredient) => ({
                            ingredientId: ingredient.ingredientId,
                            orderItemId: createdOrderItem.id,
                        })
                    )
                );
        
                if (cartItem.pizzaVariation.pizzaVariationToAdditional.length > 0) {
                    await tx.insert(orderItemToAdditional).values(
                        cartItem.pizzaVariation.pizzaVariationToAdditional.map(
                            (additional) => ({
                                additionalIngredientId: additional.additionalIngredientId,
                                orderItemId: createdOrderItem.id,
                            })
                        )
                    );
                }
            }
        });
        
        await db.delete(cartItem).where(eq(cartItem.userId, userId))
        res.json({ message: "Order has been created" });
    } catch (e) {
        res.status(400).json({ error: getErrorMessage(e) });
    }
});

orderRouter.get("/", authenticateUser, async (req, res) => {
    const userId = getUser(req);

    try {
        const foundOrders = await db.query.order.findMany({
            where: eq(order.userId, userId),
            with: {
                orderItem: {
                    with: {
                        pizza: true,
                        pizzaVariation: {
                            with: {
                                pizzaVariationToAdditional: {
                                    with: {
                                        additionalIngredient: true
                                    }
                                },
                                pizzaVariationToIngredients: true,
                                pizzaVariationToAttribute: true,
                            }
                        }
                    }
                }
            }
          });
          
        if (!foundOrders.length) {
            res.json({ data: [] });
            return;
        }

        res.json({ data: foundOrders });
    } catch (e) {
        res.status(400).json({ error: getErrorMessage(e) });
    }
});

orderRouter.get("/:orderId", authenticateUser, async (req, res) => {
    const { orderId } = req.params;
    const userId = getUser(req);

    try {
        const foundOrder = await db.query.order.findFirst({
            where: and(eq(order.userId, userId), eq(order.id, Number(orderId))),
        });

        if (!foundOrder) {
            throw new Error("Order was not found");
        }

        res.json({ data: foundOrder });
    } catch (e) {
        res.status(400).json({ error: getErrorMessage(e) });
    }
});

orderRouter.delete("/:orderId", authenticateUser, async (req, res) => {
    const { orderId } = req.params;
    const userId = getUser(req);

    try {
        const removedOrder = await db
            .delete(order)
            .where(and(eq(order.userId, userId), eq(order.id, Number(orderId))));

        res.json({ message: "Order has been removed" });
    } catch (e) {
        res.status(400).json({ err: getErrorMessage(e) });
    }
});

orderRouter.put("/:orderId", authenticateUser, async (req, res) => {
    const { orderId } = req.params;
    const userId = getUser(req);

    try {
        const { status } = z
            .object({
                status: z.enum(["pending", "processing", "delivered", "cancelled"]),
            })
            .parse(req.body);

        await db
            .update(order)
            .set({
                status: status,
            })
            .where(eq(order.userId, userId));

        res.json({ message: "Succesfully updated" });
    } catch (e) {
        res.status(400).json({ error: e });
    }
});
