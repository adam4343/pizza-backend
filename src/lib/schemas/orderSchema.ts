import { z } from "zod";

export const orderSchema = z.object({
    name: z.string().min(1, "Name should be at least 1 character").trim(),
    surname: z.string().min(1, "Surname should be at least 1 character").trim(),
    email: z.string().email(),
    phone: z.string().min(10, "Phone number should be at least 10 cahracters"),
    timeOfDelivery: z.coerce.date(),
    totalPrice: z.number().nonnegative(),
    status: z.enum(["pending", "processing", "delivered", "cancelled"]),
    pizzaId: z.number(),
    pizzaVariationId: z.number(),
    ingredientsId: z.array(z.number()),
    additionalIngredientsId: z.array(z.number()),
});
