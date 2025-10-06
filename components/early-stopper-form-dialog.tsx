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

const EarlyStopperFromDialog = (props: DialogProps) => {
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
            <DialogTitle>{t("step4.early_stopper.title")}</DialogTitle>
            <DialogDescription>
              {t("step4.early_stopper.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="num-samples">
                {t("step4.early_stopper.num_samples.title")}
              </Label>
              <div className="space-y-1">
                <Input
                  id="num-samples"
                  type="number"
                  {...register("config.early_stopper.num_samples", {
                    valueAsNumber: true,
                  })}
                />
                {errors.config?.early_stopper?.num_samples && (
                  <span className="px-1 text-destructive text-xs">
                    {t(
                      // @ts-expect-error
                      `step4.early_stopper.num_samples.${errors.config.early_stopper.num_samples.message}`,
                    )}
                  </span>
                )}
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="patience">
                {t("step4.early_stopper.patience.title")}
              </Label>
              <div className="space-y-1">
                <Input
                  id="patience"
                  {...register("config.early_stopper.patience", {
                    valueAsNumber: true,
                  })}
                />
                {errors.config?.early_stopper?.patience && (
                  <span className="px-1 text-destructive text-xs">
                    {t(
                      // @ts-expect-error
                      `step4.early_stopper.patience.${errors.config.early_stopper.patience.message}`,
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => resetField("config.early_stopper")}
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

export default EarlyStopperFromDialog;
