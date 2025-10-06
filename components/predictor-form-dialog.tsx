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

interface PredictorFormDialogProps extends DialogProps {
  headers: string[];
}

const PredictorFormDialog = ({
  headers,
  ...props
}: PredictorFormDialogProps) => {
  const t = useTranslations("project");
  const {
    register,
    resetField,
    formState: { errors },
  } = useFormContext<FormData>();

  if (headers.length < 3) {
    return null;
  }

  return (
    <Dialog {...props}>
      <DialogContent className="px-0">
        <div className="space-y-8">
          <DialogHeader className="px-6">
            <DialogTitle>{t("step4.predictor.title")}</DialogTitle>
            <DialogDescription>
              {t("step4.predictor.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="h-[240px] space-y-12 overflow-y-auto px-6">
            {headers.slice(2).map((header, index) => (
              <div key={index.toString()} className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="font-medium">{header}</div>
                  <hr className="flex-1" />
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor={`${header}-num-destructions`}>
                      {t("step4.predictor.num_destructions.title")}
                    </Label>
                    <div className="space-y-1">
                      <Input
                        id={`${header}-num-destructions`}
                        type="number"
                        {...register(
                          `config.predictor.${header}.num_destructions`,
                          { valueAsNumber: true },
                        )}
                      />
                      {errors.config?.predictor?.[header]?.num_destructions && (
                        <span className="px-1 text-destructive text-xs">
                          {t(
                            // @ts-expect-error
                            `step4.predictor.num_destructions.${errors.config.predictor[header].num_destructions.message}`,
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor={`${header}-num-mutations`}>
                      {t("step4.predictor.num_mutations.title")}
                    </Label>
                    <div className="space-y-1">
                      <Input
                        id={`${header}-num-mutations`}
                        type="number"
                        {...register(
                          `config.predictor.${header}.num_mutations`,
                          { valueAsNumber: true },
                        )}
                      />
                      {errors.config?.predictor?.[header]?.num_mutations && (
                        <span className="px-1 text-destructive text-xs">
                          {t(
                            // @ts-expect-error
                            `step4.predictor.num_mutations.${errors.config.predictor[header].num_mutations.message}`,
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="px-6">
            <Button
              variant="outline"
              onClick={() => resetField("config.predictor")}
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

export default PredictorFormDialog;
