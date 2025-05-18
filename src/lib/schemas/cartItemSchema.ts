import { z } from "zod";

export const cartItemSchema = z.object({
   pizzaId: z.number(),
   pizzaVariationId: z.number(),
   ingredientsId: z.array(z.number()),
   additionalIngredientsId: z.array(z.number()).optional(),
})

