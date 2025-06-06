import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "invalid_email" }),
});

export const signupSchema = z.object({
  email: z.string().email({ message: "invalid_email" }),
});
