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

const RunnerFormDialog = (props: DialogProps) => {
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
            <DialogTitle>{t("step4.runner.title")}</DialogTitle>
            <DialogDescription>
              {t("step4.runner.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="num-iterations">
                {t("step4.runner.num_iterations.title")}
              </Label>
              <div className="space-y-1">
                <Input
                  id="num-iterations"
                  type="number"
                  {...register("config.runner.num_iterations", {
                    valueAsNumber: true,
                  })}
                />
                {errors.config?.runner?.num_iterations && (
                  <span className="px-1 text-destructive text-xs">
                    {t(
                      // @ts-expect-error
                      `step4.runner.num_iterations.${errors.config.runner.num_iterations.message}`,
                    )}
                  </span>
                )}
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="prompt">
                {t("step4.runner.num_sequences.title")}
              </Label>
              <div className="space-y-1">
                <Input
                  id="num_sequences"
                  {...register("config.runner.num_sequences", {
                    valueAsNumber: true,
                  })}
                />
                {errors.config?.runner?.num_sequences && (
                  <span className="px-1 text-destructive text-xs">
                    {t(
                      // @ts-expect-error
                      `step4.runner.num_sequences.${errors.config.runner.num_sequences.message}`,
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => resetField("config.runner")}
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

export default RunnerFormDialog;
