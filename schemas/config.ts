import { z } from "zod/v4";

const stringToNumber = z.codec(
  z.string().regex(z.regexes.number, { error: "invalid_type" }),
  z.number(),
  {
    decode: (str) => Number.parseFloat(str),
    encode: (num) => num.toString(),
  },
);

const numberToString = z.codec(z.number(), z.string(), {
  decode: (num) => num.toString(),
  encode: (str) => Number(str),
});

export const samplerSchema = z.object({
  num_shuffles: stringToNumber
    .pipe(z.int({ error: "invalid_type" }).min(0, { error: "too_small" }))
    .pipe(numberToString),
  shuffle_rate: stringToNumber
    .pipe(
      z
        .number({ error: "invalid_type" })
        .min(0, { error: "too_small" })
        .max(1, { error: "too_big" }),
    )
    .pipe(numberToString),
  window_sizes: z
    .string()
    .regex(/^\d+(?:\s*,\s*\d+)*$/, { message: "invalid_format" })
    .refine(
      (text) =>
        text
          .split(",")
          .map((str) => Number(str.trim()))
          .every((value) => Number.isInteger(value)),
      { message: "invalid_type" },
    )
    .refine(
      (text) =>
        text
          .split(",")
          .map((str) => Number(str.trim()))
          .every((value) => value >= 1),
      { message: "too_small" },
    ),
});

export const predictorSchema = z.record(
  z.string(),
  z.object({
    destruct_per_samples: stringToNumber
      .pipe(z.int({ error: "invalid_type" }).min(0, { error: "too_small" }))
      .pipe(numberToString),
    num_destructions: stringToNumber
      .pipe(z.int({ error: "invalid_type" }).min(0, { error: "too_small" }))
      .pipe(numberToString),
    mutate_per_samples: stringToNumber
      .pipe(z.int({ error: "invalid_type" }).min(0, { error: "too_small" }))
      .pipe(numberToString),
    num_mutations: stringToNumber
      .pipe(z.int({ error: "invalid_type" }).min(0, { error: "too_small" }))
      .pipe(numberToString),
  }),
);

export const evaluatorSchema = z.record(
  z.string(),
  z
    .discriminatedUnion("mode", [
      z.object({ mode: z.literal("min") }),
      z.object({ mode: z.literal("max") }),
      z
        .object({
          mode: z.literal("range"),
          lower: stringToNumber
            .pipe(z.number({ error: "invalid_type" }))
            .pipe(numberToString),
          upper: stringToNumber
            .pipe(z.number({ error: "invalid_type" }))
            .pipe(numberToString),
        })
        .refine((v) => Number(v.lower) < Number(v.upper), {
          path: ["upper"],
          message: "invalid_range",
        }),
    ])
    .and(
      z.object({
        series: z.union([
          z.object({
            top_p: stringToNumber
              .pipe(
                z
                  .number({ error: "invalid_type" })
                  .gt(0, { error: "too_small" })
                  .lte(1, { error: "too_big" }),
              )
              .pipe(numberToString),
          }),
          z.object({
            top_k: stringToNumber
              .pipe(
                z.int({ error: "invalid_type" }).gte(1, { error: "too_small" }),
              )
              .pipe(numberToString),
          }),
        ]),
        parallel: z.union([
          z.object({
            top_p: stringToNumber
              .pipe(
                z
                  .number({ error: "invalid_type" })
                  .gt(0, { error: "too_small" })
                  .lte(1, { error: "too_big" }),
              )
              .pipe(numberToString),
          }),
          z.object({
            top_k: stringToNumber
              .pipe(
                z.int({ error: "invalid_type" }).gte(1, { error: "too_small" }),
              )
              .pipe(numberToString),
          }),
        ]),
      }),
    ),
);

export const generatorSchema = z.object({
  max_new_token: stringToNumber
    .pipe(z.int({ error: "invalid_type" }).min(0, { error: "too_small" }))
    .pipe(numberToString),
  prompt: z
    .string()
    .regex(/^[ACDEFGHIKLMNPQRSTVWY]+$/i, { error: "invalid_format" })
    .or(z.literal("")),
});

export const earlyStopperSchema = z.object({
  num_samples: stringToNumber
    .pipe(z.int({ error: "invalid_type" }).min(1, { error: "too_small" }))
    .pipe(numberToString),
  patience: stringToNumber
    .pipe(z.int({ error: "invalid_type" }).min(1, { error: "too_small" }))
    .pipe(numberToString),
});

export const runnerSchema = z.object({
  num_iterations: stringToNumber
    .pipe(z.int({ error: "invalid_type" }).min(1, { error: "too_small" }))
    .pipe(numberToString),
  num_sequences: stringToNumber
    .pipe(z.int({ error: "invalid_type" }).min(1, { error: "too_small" }))
    .pipe(numberToString),
});

export const configSchema = z.object({
  sampler: samplerSchema,
  predictor: predictorSchema,
  evaluator: evaluatorSchema,
  generator: generatorSchema,
  early_stopper: earlyStopperSchema,
  runner: runnerSchema,
});
