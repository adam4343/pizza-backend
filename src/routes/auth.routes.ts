import { CookieOptions, Router } from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // Added missing import
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
import { OAuth2Client } from "google-auth-library";

// Import Brevo correctly
import * as brevo from '@getbrevo/brevo';

export const authRouter = Router();

// Initialize Brevo properly
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_KEY || '');

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

      res.json({ message: "You have been successfully logged in!" });
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

      try {
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.subject = "Welcome to Dodo Pizza!";
        sendSmtpEmail.htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #fdfdfd; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #FF5E00;">🍕 Welcome to Dodo Pizza!</h2>
            <p style="font-size: 16px; color: #333;">
              Hi <strong>${newUser.name ?? "there"}</strong>,
            </p>
            <p style="font-size: 16px; color: #333;">
              We're excited to have you on board. You've successfully created an account with us using Google!
            </p>
            <p style="font-size: 16px; color: #333;">
              Start exploring our delicious range of pizzas and enjoy a seamless ordering experience.
            </p>
            <a href="https://next-pizza-black.vercel.app" style="display: inline-block; margin-top: 20px; padding: 12px 20px; background-color: #FF5E00; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
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
        `;
        sendSmtpEmail.sender = { "name": "Dodo Pizza", "email": "adam.ingor1234@gmail.com" };
        sendSmtpEmail.to = [{ "email": newUser.email, "name": newUser.name }];

        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Welcome email sent successfully to:', newUser.email);
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
      }

      res.json({ message: "You have been successfully logged in!" });
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

    const tokenPayload = { userId: existingUser.id };

    const token = jwt.sign(tokenPayload, env.SECRET_KEY);

    res.cookie("auth-token", token, cookieOption);

    try {
      const now = new Date();
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = "New Login to Your Dodo Pizza Account";
      sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #fdfdfd; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #FF5E00;">🍕 Account Login Alert</h2>
          <p style="font-size: 16px; color: #333;">
            Hi <strong>${existingUser.name ?? "there"}</strong>,
          </p>
          <p style="font-size: 16px; color: #333;">
            We detected a new login to your Dodo Pizza account.
          </p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #666;"><strong>Login Time:</strong> ${now.toLocaleString()}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${existingUser.email}</p>
          </div>
          <p style="font-size: 16px; color: #333;">
            If this was you, no action is needed. If you didn't log in, please secure your account immediately.
          </p>
          <a href="https://next-pizza-black.vercel.app/auth/forgot-password" style="display: inline-block; margin-top: 20px; padding: 12px 20px; background-color: #dc3545; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
          <p style="margin-top: 30px; font-size: 14px; color: #777;">
            For account security, we recommend using a strong, unique password.
          </p>
          <p style="font-size: 14px; color: #777;">
            Stay safe,<br />
            The Dodo Team
          </p>
        </div>
      `;
      sendSmtpEmail.sender = { "name": "Dodo Pizza Security", "email": "adam.ingor1234@gmail.com" };
      sendSmtpEmail.to = [{ "email": existingUser.email, "name": existingUser.name }];

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Login notification email sent successfully to:', existingUser.email);
    } catch (emailError) {
      console.error('Error sending login notification email:', emailError);
    }

    res.json({ data: "You have been successfully logged in!" });
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

    const tokenPayload = { userId: newUser.id };

    const token = jwt.sign(tokenPayload, env.SECRET_KEY);

    res.cookie("auth-token", token, cookieOption);

    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = "Welcome to Dodo Pizza!";
      sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #fdfdfd; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #FF5E00;">🍕 Welcome to Dodo Pizza!</h2>
          <p style="font-size: 16px; color: #333;">
            Hi <strong>${newUser.name ?? "there"}</strong>,
          </p>
          <p style="font-size: 16px; color: #333;">
            We're excited to have you on board. You've successfully created an account with us!
          </p>
          <p style="font-size: 16px; color: #333;">
            Start exploring our delicious range of pizzas and enjoy a seamless ordering experience.
          </p>
          <a href="https://next-pizza-black.vercel.app" style="display: inline-block; margin-top: 20px; padding: 12px 20px; background-color: #FF5E00; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
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
      `;
      sendSmtpEmail.sender = { "name": "Dodo Pizza", "email": "adam.ingor1234@gmail.com" };
      sendSmtpEmail.to = [{ "email": newUser.email, "name": newUser.name }];

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Welcome email sent successfully to:', newUser.email);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }

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
    const expiresAt = addDays(new Date(), 1); 
    
    await db.insert(verificationCode).values({
      userId: existingUser.id,
      token: token,
      expiresAt: expiresAt,
    });

    const resetLink = `https://next-pizza-black.vercel.app/auth/reset-password/?token=${token}`;

    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = "Reset Your Dodo Pizza Password";
      sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #fdfdfd; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #FF5E00;">🍕 Password Reset Request</h2>
          <p style="font-size: 16px; color: #333;">
            Hi <strong>${existingUser.name ?? "there"}</strong>,
          </p>
          <p style="font-size: 16px; color: #333;">
            We received a request to reset your password for your Dodo Pizza account.
          </p>
          <p style="font-size: 16px; color: #333;">
            Click the button below to reset your password:
          </p>
          <a href="${resetLink}" style="display: inline-block; margin-top: 20px; padding: 12px 20px; background-color: #FF5E00; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
          <p style="margin-top: 30px; font-size: 14px; color: #777;">
            If you did not request this password reset, please ignore this email. This link will expire in 24 hours.
          </p>
          <p style="font-size: 14px; color: #777;">
            Cheers,<br />
            The Dodo Team
          </p>
        </div>
      `;
      sendSmtpEmail.sender = { "name": "Dodo Pizza", "email": "adam.ingor1234@gmail.com" };
      sendSmtpEmail.to = [{ "email": existingUser.email, "name": existingUser.name }];

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Password reset email sent successfully to:', existingUser.email);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      throw new Error('Failed to send password reset email. Please try again.');
    }

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

    await db
      .delete(verificationCode)
      .where(eq(verificationCode.token, token));

    const updatedUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (updatedUser) {
      try {
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.subject = "Your Dodo Pizza Password Has Been Changed";
        sendSmtpEmail.htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #fdfdfd; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #28a745;">🔒 Password Successfully Changed</h2>
            <p style="font-size: 16px; color: #333;">
              Hi <strong>${updatedUser.name ?? "there"}</strong>,
            </p>
            <p style="font-size: 16px; color: #333;">
              Your Dodo Pizza account password has been successfully changed.
            </p>
            <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
              <p style="margin: 0; color: #155724;"><strong>✅ Password updated successfully</strong></p>
              <p style="margin: 5px 0 0 0; color: #155724; font-size: 14px;">Time: ${new Date().toLocaleString()}</p>
            </div>
            <p style="font-size: 16px; color: #333;">
              You can now log in with your new password. Your account is secure.
            </p>
            <a href="https://next-pizza-black.vercel.app/auth/login/login" style="display: inline-block; margin-top: 20px; padding: 12px 20px; background-color: #FF5E00; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Log In Now
            </a>
            <p style="margin-top: 30px; font-size: 14px; color: #777;">
              If you did not make this change, please contact our support team immediately.
            </p>
            <p style="font-size: 14px; color: #777;">
              Stay secure,<br />
              The Dodo Team
            </p>
          </div>
        `;
        sendSmtpEmail.sender = { "name": "Dodo Pizza Security", "email": "adam.ingor1234@gmail.com" };
        sendSmtpEmail.to = [{ "email": updatedUser.email, "name": updatedUser.name }];

        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Password change confirmation email sent successfully to:', updatedUser.email);
      } catch (emailError) {
        console.error('Error sending password change confirmation email:', emailError);
      }
    }

    res.json({ data: "Password was changed successfully" });
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