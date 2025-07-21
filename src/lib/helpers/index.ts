import { Request } from "express";

export function generateUniqueId() {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}

export function getUser(req: Request) {
  // @ts-ignore

  console.log('Full req.user object:', req.user);
  // @ts-ignore

  console.log('req.user.userId:', req.user.userId);
  // @ts-ignore

  console.log('typeof req.user.userId:', typeof req.user.userId);
  // @ts-ignore
  return req.user.userId as number
}