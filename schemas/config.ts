import { z } from "zod/v4";

export const samplerSchema = z.object({
  num_sequences: z
    .int({ error: "invalid_type" })
    .min(0, { error: "too_small" }),
  shuffle_rate: z
    .number({ error: "invalid_type" })
    .min(0, { error: "too_small" })
    .max(1, { error: "too_big" }),
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
    num_destructions: z
      .int({ error: "invalid_type" })
      .min(0, { error: "too_small" }),
    num_mutations: z
      .int({ error: "invalid_type" })
      .min(0, { error: "too_small" }),
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
          lower: z.number({ error: "invalid_type" }),
          upper: z.number({ error: "invalid_type" }),
        })
        .refine((value) => value.lower < value.upper, {
          message: "invalid_range",
          path: ["upper", "lower"],
        }),
    ])
    .and(
      z.object({
        series: z.union([
          z.object({
            mode: z.literal("top_p"),
            value: z
              .number({ error: "invalid_type" })
              .gt(0, { error: "too_small" })
              .lte(1, { error: "too_big" }),
          }),
          z.object({
            mode: z.literal("top_k"),
            value: z
              .int({ error: "invalid_type" })
              .gte(1, { error: "too_small" }),
          }),
        ]),
        parallel: z.union([
          z.object({
            mode: z.literal("top_p"),
            value: z
              .number({ error: "invalid_type" })
              .gt(0, { error: "too_small" })
              .lte(1, { error: "too_big" }),
          }),
          z.object({
            mode: z.literal("top_k"),
            value: z
              .int({ error: "invalid_type" })
              .gte(1, { error: "too_small" }),
          }),
        ]),
      }),
    ),
);

export const generatorSchema = z.object({
  max_new_token: z
    .int({ error: "invalid_type" })
    .min(0, { error: "too_small" }),
  prompt: z
    .string()
    .regex(/^[ACDEFGHIKLMNPQRSTVWY]+$/i, { error: "invalid_format" })
    .or(z.literal("")),
});

export const earlyStopperSchema = z.object({
  num_samples: z.int({ error: "invalid_type" }).min(1, { error: "too_small" }),
  patience: z.int({ error: "invalid_type" }).min(1, { error: "too_small" }),
});

export const runnerSchema = z.object({
  num_iterations: z
    .int({ error: "invalid_type" })
    .min(1, { error: "too_small" }),
  num_sequences: z
    .int({ error: "invalid_type" })
    .min(1, { error: "too_small" }),
});

export const configSchema = z.object({
  sampler: samplerSchema,
  predictor: predictorSchema,
  evaluator: evaluatorSchema,
  generator: generatorSchema,
  early_stopper: earlyStopperSchema,
  runner: runnerSchema,
});
