import "dotenv/config";
import z from "zod"

const localEnvSchema = z.object({
    DB_FILE_NAME: z.string(),
    SECRET_KEY: z.string(),
    NODE_ENV: z.string()
})
const localEnv = {
    DB_FILE_NAME: process.env.DB_FILE_NAME,
    SECRET_KEY: process.env.SECRET_KEY,
    NODE_ENV: process.env.NODE_ENV
}

export const env = localEnvSchema.parse(localEnv);

