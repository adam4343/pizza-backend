import { NextFunction, Request, Response } from "express";
import { env } from "../lib/configs/env";
import jwt from "jsonwebtoken";
import "dotenv/config";

export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authCookie = req.signedCookies["auth-token"];
  if (!authCookie) {
      res.status(400).json({error: "Please sign in to continue"});
      return;
  };
  
  const decryptedUser = jwt.verify(authCookie, env.SECRET_KEY);
  if (!decryptedUser) {
      res.status(400).json({ error: 'You are not authorized' });
      return;
  }
  
  // Debug: Log the entire decoded user object
  console.log("Decoded user object:", decryptedUser);
  
  // @ts-ignore
  req.user = decryptedUser;
  next();
}