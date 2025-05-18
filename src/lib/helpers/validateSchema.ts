import { ZodError, ZodSchema } from "zod";

export function validateSchema<T>(schema: ZodSchema<T>, data: any): T {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new ZodError(result.error.issues);
    }
    return result.data; 
  }
  