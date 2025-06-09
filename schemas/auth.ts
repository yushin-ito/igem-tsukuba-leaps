import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email({ message: "invalid_email" }),
});

export const signupSchema = z.object({
  email: z.email({ message: "invalid_email" }),
});
