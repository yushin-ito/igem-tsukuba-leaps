import { parseDSV } from "@/lib/utils";
import { configSchema } from "@/schemas/config";
import { z } from "zod/v4";

export const renameSchema = z.object({
  name: z
    .string()
    .min(1, { error: "too_short" })
    .max(64, { error: "too_long" }),
});

export const tableSchema = z
  .object({
    headers: z.array(z.string()),
  })
  .refine(({ headers }) => headers[0] === "id", {
    path: ["headers", 0],
  })
  .refine(({ headers }) => headers[1] === "sequence", {
    path: ["headers", 1],
  });

export const projectSchema = z
  .object({
    text: z.string(),
    config: configSchema,
  })
  .refine(
    ({ text }) => {
      const { rows } = parseDSV(text);
      return rows.length >= 40;
    },
    { message: "too_few_rows", path: ["text"] },
  )
  .refine(
    ({ text }) => {
      const { headers } = parseDSV(text);
      return headers[0] === "id";
    },
    { message: "required_id", path: ["text"] },
  )
  .refine(
    ({ text }) => {
      const { headers } = parseDSV(text);
      return headers[1] === "sequence";
    },
    { message: "required_sequence", path: ["text"] },
  )
  .refine(
    ({ text }) => {
      const { headers } = parseDSV(text);
      return headers.length - 2 >= 1;
    },
    { message: "too_few_values", path: ["text"] },
  )
  .refine(
    ({ text }) => {
      const { headers } = parseDSV(text);
      return headers.length - 2 <= 5;
    },
    { message: "too_many_values", path: ["text"] },
  );
