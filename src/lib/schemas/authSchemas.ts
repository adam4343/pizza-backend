import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter correct email"),
  password: z.string().min(6, "Password should be at least 6 characters"),
});

export const registerSchema = z.object({
    name: z.string(), 
    email: z.string().email(),
    password: z.string().min(6, "Password should be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password should be at least 6 characters"),
}).refine((values) => values.password === values.confirmPassword , {
    message: "Password dont match",
    path: ["confirmPassword"] 
})

export const forgotPasswordSchema = z.object({
    email: z.string().email()
})

export const resetPasswordSchema = z.object({
    password: z.string().min(6, "Password should be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password should be at least 6 characters"),
}).refine((values) => values.password === values.confirmPassword , {
    message: "Password dont match",
    path: ["confirmPassword"] 
})

export const emailSchema = z.object({
    email: z.string().email("Please enter correct email"),
})