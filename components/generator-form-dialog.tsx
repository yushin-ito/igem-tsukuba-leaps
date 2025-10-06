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

const GeneratorFormDialog = (props: DialogProps) => {
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
            <DialogTitle>{t("step4.generator.title")}</DialogTitle>
            <DialogDescription>
              {t("step4.generator.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="max-new-token">
                {t("step4.generator.max_new_token.title")}
              </Label>
              <div className="space-y-1">
                <Input
                  id="max-new-token"
                  type="number"
                  {...register("config.generator.max_new_token")}
                />
                {errors.config?.generator?.max_new_token && (
                  <span className="px-1 text-destructive text-xs">
                    {t(
                      // @ts-expect-error
                      `step4.generator.max_new_token.${errors.config.generator.max_new_token.message}`,
                    )}
                  </span>
                )}
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="prompt">
                {t("step4.generator.prompt.title")}
              </Label>
              <div className="space-y-1">
                <Input id="prompt" {...register("config.generator.prompt")} />
                {errors.config?.generator?.prompt && (
                  <span className="px-1 text-destructive text-xs">
                    {t(
                      // @ts-expect-error
                      `step4.generator.prompt.${errors.config.generator.prompt.message}`,
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => resetField("config.generator")}
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

export default GeneratorFormDialog;
