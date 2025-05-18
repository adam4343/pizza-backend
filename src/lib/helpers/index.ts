import { Request } from "express";

export function generateUniqueId() {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}

export function getUser(req: Request) {
  // @ts-ignore
  return req.user.id as number
}