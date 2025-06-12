import { z } from "zod/v4";

export const messageSchema = z.object({
  text: z.string().min(1).max(1024),
});

export const renameSchema = z.object({
  name: z
    .string()
    .min(1, { error: "too_short" })
    .max(64, { error: "too_long" }),
});
