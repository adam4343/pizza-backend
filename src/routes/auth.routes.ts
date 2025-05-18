import { CookieOptions, Router } from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { getErrorMessage } from "../lib/errors/getErrorMessage";
import {
  emailSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../lib/schemas/authSchemas";
import { validateSchema } from "../lib/helpers/validateSchema";
import { env } from "../lib/configs/env";
import { user, verificationCode } from "../db/schemas/user.schema";
import { addDays } from "date-fns";
import { Resend } from "resend";
import { OAuth2Client } from "google-auth-library";

export const authRouter = Router();
const resend = new Resend(process.env.RESEND_KEY);
const cookieOption: CookieOptions = {
  signed: true,
  expires: addDays(new Date(), 7),
  httpOnly: true,
  secure: env.NODE_ENV === "dev" ? false : true,
  sameSite: env.NODE_ENV === "dev" ? "lax" : "none",
};

authRouter.post("/google", async (req, res) => {
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT);

    const ticket = await client.verifyIdToken({
      idToken: req.body.token,
      audience: process.env.GOOGLE_CLIENT,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.name) {
      throw new Error("There was an unexpected issue");
    }

    const { sub, email, name } = payload;

    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (existingUser) {
      const tokenPayload = { userId: existingUser.id };

      const token = jwt.sign(tokenPayload, env.SECRET_KEY);

      res.cookie("auth-token", token, cookieOption);

      res.json({ message: "You have been succesfully logged in!" });
      return;
    } else {
      const [newUser] = await db
        .insert(user)
        .values({
          email: email,
          name: name,
          googleId: sub,
        })
        .returning();

      const tokenPayload = { userId: newUser.id };

      const token = jwt.sign(tokenPayload, env.SECRET_KEY);

      res.cookie("auth-token", token, cookieOption);

      res.json({ message: "You have been succesfully logged in!" });
    }
  } catch (e) {
    res.status(400).json({ error: getErrorMessage(e) });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const body = validateSchema(loginSchema, req.body);

    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, body.email),
    });

    if (!existingUser) {
      throw new Error("User with this email was not found");
    }

    if (!existingUser.password) {
      throw new Error("Invalid credentials, please register");
    }

    const correctPassword = await bcrypt.compare(
      body.password,
      existingUser.password
    );

    if (!correctPassword) {
      throw new Error("Passwords do not match");
    }

    const tokenPayload = { id: existingUser.id };

    const token = jwt.sign(tokenPayload, env.SECRET_KEY);

    res.cookie("auth-token", token, cookieOption);

    res.json({ data: "You have been succesfully logged in!" });
  } catch (e) {
    res.status(400).json({ error: getErrorMessage(e) });
  }
});

authRouter.post("/register", async (req, res) => {
  try {
    const body = validateSchema(registerSchema, req.body);

    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, body.email),
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const [newUser] = await db
      .insert(user)
      .values({
        name: body.name,
        email: body.email,
        password: hashedPassword,
      })
      .returning();

    const tokenPayload = { id: newUser.id };

    const token = jwt.sign(tokenPayload, env.SECRET_KEY);

    res.cookie("auth-token", token, cookieOption);

    const text = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "adam.ingor1234@gmail.com",
      subject: "Welcome to Dodo Pizza!",
      html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #fdfdfd; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #FF5E00;">🍕 Welcome to Dodo Pizza!</h2>
                <p style="font-size: 16px; color: #333;">
                  Hi <strong>${newUser.name ?? "there"}</strong>,
                </p>
                <p style="font-size: 16px; color: #333;">
                  We're excited to have you on board. You’ve successfully created an account with us!
                </p>
                <p style="font-size: 16px; color: #333;">
                  Start exploring our delicious range of pizzas and enjoy a seamless ordering experience.
                </p>
                <a href="https://your-app-url.com" style="display: inline-block; margin-top: 20px; padding: 12px 20px; background-color: #FF5E00; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Order Now
                </a>
                <p style="margin-top: 30px; font-size: 14px; color: #777;">
                  If you did not sign up for this account, please ignore this email.
                </p>
                <p style="font-size: 14px; color: #777;">
                  Cheers,<br />
                  The Dodo Team
                </p>
              </div>
            `,
    });
    res.json({ data: newUser, message: "User created successfully" });
  } catch (e) {
    res.status(400).json({ error: getErrorMessage(e) });
  }
});

authRouter.post("/forgot-password", async (req, res) => {
  try {
    const body = validateSchema(forgotPasswordSchema, req.body);

    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, body.email),
    });

    if (!existingUser) {
      throw new Error("User with this email does not exist");
    }

    const token = crypto.randomUUID();

    const resetLink = `http:localhost:3000/reset-password/?token=${token}`;

    res.json({ data: `Reset link sent to ${existingUser.email}` });
  } catch (e) {
    res.status(400).json({ error: getErrorMessage(e) });
  }
});

authRouter.post("/reset-password", async (req, res) => {
  const { token } = req.body;

  try {
    const body = validateSchema(resetPasswordSchema, req.body);

    const foundToken = await db.query.verificationCode.findFirst({
      where: eq(verificationCode.token, token),
    });

    if (!foundToken) {
      throw new Error("Incorrect token provided");
    }

    if (new Date() > new Date(foundToken.expiresAt)) {
      throw new Error("Token has expired");
    }

    const userId = foundToken.userId;

    const hashedPassword = await bcrypt.hash(body.password, 10);

    await db
      .update(user)
      .set({ password: hashedPassword })
      .where(eq(user.id, userId));

    res.json({ data: "Password was changed succesfully" });
  } catch (e) {
    res.status(400).json({ error: getErrorMessage(e) });
  }
});

authRouter.post("/logout", (req, res) => {
  try {
    const authCookie = req.signedCookies["auth-token"];
    if (!authCookie) {
      throw new Error("This user is not authenticated");
    }

    res.clearCookie("auth-token", cookieOption);

    res.json({ data: "You were logged out" });
  } catch (e) {
    res.status(400).json({ error: getErrorMessage(e) });
  }
});

authRouter.get("/me", (req, res) => {
  try {
    const authCookie = req.signedCookies["auth-token"];

    if (!authCookie) {
      throw new Error("This user is not authenticated");
    }

    const decodedCookie = jwt.verify(authCookie, env.SECRET_KEY);

    res.json({ data: decodedCookie });
  } catch (e) {
    res.status(400).json({ error: getErrorMessage(e) });
  }
});

authRouter.post("/check-email", async (req, res) => {
  try {
    const body = validateSchema(emailSchema, req.body);

    const foundUser = await db.query.user.findFirst({
      where: eq(user.email, body.email),
    });

    if (foundUser) {
      throw new Error("Email has been taken");
    }

    res.json({ message: "Email is not taken" });
  } catch (e) {
    res.status(400).json({ error: getErrorMessage(e) });
  }
});
