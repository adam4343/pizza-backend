import { z } from "zod";

export const pizzaSchema = z.object({
    name: z.string(),
    type: z.string(),
    ingredients:  
    z.array(
      z.object({
        name: z.string(),
        isRemovable: z.boolean().optional().default(false),
      })
    ).or(z.array(z.number())),
    variations: z.array(z.object({
      pizzaVariation:
          z.object({
            name: z.string(),
            price: z.number().positive(),
            weight: z.number().positive(),
            image: z.string(),
          }),
      
        ingredients:  
        z.array(
          z.object({
            name: z.string(),
            isRemovable: z.boolean().optional().default(false),
          })
        ).or(z.array(z.number())),
      
        additionalIngredients: z.array(
          z.object({
            name: z.string(),
            price: z.number().positive(),
            image: z.string(),
          })
        ).or(z.array(z.number())),
      
        attributes: z.array(
          z.object({
            type: z.string(),
            name: z.string(),
          })
        ),
    }))
  });