import {ZodError} from "zod"

export function getErrorMessage(err: unknown): string {
    let message = "";
    
    if (err instanceof ZodError) {
      message = err.issues[0]?.message ?? err.message;
    } else if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === "string") {
      message = err;
    } else if (err && typeof err === "object" && "message" in err) {
      message = String(err.message);
    }
  
    return message;
  }
  