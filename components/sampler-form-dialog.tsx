"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { projectSchema } from "@/schemas/project";
import type { DialogProps } from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import type z from "zod/v4";

type FormData = z.infer<typeof projectSchema>;

const SamplerFormDialog = (props: DialogProps) => {
  const t = useTranslations("project");
  const {
    register,
    resetField,
    formState: { errors },
  } = useFormContext<FormData>();

  return (
    <Dialog {...props}>
      <DialogContent>
        <div className="space-y-8">
          <DialogHeader>
            <DialogTitle>{t("step4.sampler.title")}</DialogTitle>
            <DialogDescription>
              {t("step4.sampler.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="num-shuffles">
                {t("step4.sampler.num_sequences.title")}
              </Label>
              <div className="space-y-1">
                <Input
                  id="num-shuffles"
                  type="number"
                  {...register("config.sampler.num_sequences", {
                    valueAsNumber: true,
                  })}
                />
                {errors.config?.sampler?.num_sequences && (
                  <span className="px-1 text-destructive text-xs">
                    {t(
                      // @ts-expect-error
                      `step4.sampler.num_sequences.${errors.config.sampler.num_sequences.message}`,
                    )}
                  </span>
                )}
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="shuffle-rate">
                {t("step4.sampler.shuffle_rate.title")}
              </Label>
              <div className="space-y-1">
                <Input
                  id="shuffle-rate"
                  type="number"
                  step="0.01"
                  {...register("config.sampler.shuffle_rate", {
                    valueAsNumber: true,
                  })}
                />
                {errors.config?.sampler?.shuffle_rate && (
                  <span className="px-1 text-destructive text-xs">
                    {t(
                      // @ts-expect-error
                      `step4.sampler.shuffle_rate.${errors.config.sampler.shuffle_rate.message}`,
                    )}
                  </span>
                )}
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="window-sizes">
                {t("step4.sampler.window_sizes.title")}
              </Label>
              <div className="space-y-1">
                <Input
                  id="window-sizes"
                  placeholder="1, 3, 5"
                  {...register("config.sampler.window_sizes")}
                />
                {errors.config?.sampler?.window_sizes && (
                  <span className="px-1 text-destructive text-xs">
                    {t(
                      // @ts-expect-error
                      `step4.sampler.window_sizes.${errors.config.sampler.window_sizes.message}`,
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => resetField("config.sampler")}
            >
              {t("step4.clear")}
            </Button>
            <DialogClose asChild>
              <Button>{t("step4.done")}</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SamplerFormDialog;
