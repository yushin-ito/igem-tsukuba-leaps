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

export const pathogenSchema = z.object({
  id: z.number().int().positive(),
  category: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  name: z.string().min(1),
});

export const biosafetySchema = z.object({
  toxin: z.enum(["yes", "no"], { error: "required" }),
  pathogen: z.enum(["yes", "no"], { error: "required" }),
  virus: z.enum(["yes", "no"], { error: "required" }),
});

export const datasetSchema = z
  .string()
  .refine(
    (value) => {
      const { rows } = parseDSV(value);
      return rows.length >= 40;
    },
    { message: "row.too_few" },
  )
  .refine(
    (value) => {
      const { rows } = parseDSV(value);
      return rows.length <= 10000;
    },
    { message: "row.too_many" },
  )
  .refine(
    (value) => {
      const { headers } = parseDSV(value);
      return headers[0] === "id";
    },
    { message: "id.required" },
  )
  .refine(
    (value) => {
      const { rows } = parseDSV(value);
      const ids = rows.map((row) => row[0]);
      return new Set(ids).size === ids.length;
    },
    { message: "id.duplicate" },
  )
  .refine(
    (value) => {
      const { headers } = parseDSV(value);
      return headers[1] === "sequence";
    },
    { message: "sequence.required" },
  )
  .refine(
    (value) => {
      const { rows } = parseDSV(value);
      return rows.every((row) => /^[ACDEFGHIKLMNPQRSTVWY]+$/.test(row[1]));
    },
    { message: "sequence.invalid_format" },
  )
  .refine(
    (value) => {
      const { headers } = parseDSV(value);
      return headers.length - 2 >= 1;
    },
    { message: "header.too_few" },
  )
  .refine(
    (value) => {
      const { headers } = parseDSV(value);
      return headers.length - 2 <= 5;
    },
    { message: "header.too_many" },
  );

export const projectSchema = z.object({
  biosafety: biosafetySchema,
  dataset: datasetSchema,
  config: configSchema,
});
