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
  .refine(({ headers }) => headers[0] === "id")
  .refine(({ headers }) => headers[1] === "sequence");

export const confirmSchema = z.object({
  question: z.object({
    toxin: z.enum(["yes", "no"], { error: "required" }),
    pathogen: z.enum(["yes", "no"], { error: "required" }),
    virus: z.enum(["yes", "no"], { error: "required" }),
  }),
  consent: z.object({
    compliance: z.literal(true, { error: "required" }),
    disclaimer: z.literal(true, { error: "required" }),
    warranty: z.literal(true, { error: "required" }),
  }),
});

export const datasetSchema = z
  .string()
  .refine(
    (value) => {
      const { rows } = parseDSV(value);
      return rows.length >= 40;
    },
    { message: "too_few_rows" },
  )
  .refine(
    (value) => {
      const { headers } = parseDSV(value);
      return headers[0] === "id";
    },
    { message: "required_id" },
  )
  .refine(
    (value) => {
      const { headers } = parseDSV(value);
      return headers[1] === "sequence";
    },
    { message: "required_sequence" },
  )
  .refine(
    (value) => {
      const { headers } = parseDSV(value);
      return headers.length - 2 >= 1;
    },
    { message: "too_few_headers" },
  )
  .refine(
    (value) => {
      const { headers } = parseDSV(value);
      return headers.length - 2 <= 5;
    },
    { message: "too_many_headers" },
  );

export const projectSchema = z.object({
  confirm: confirmSchema,
  text: datasetSchema,
  config: configSchema,
});
