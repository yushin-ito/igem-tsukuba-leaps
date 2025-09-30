import type { pathogenSchema } from "@/schemas/project";
import type z from "zod/v4";

export type Pathogen = z.infer<typeof pathogenSchema>;
