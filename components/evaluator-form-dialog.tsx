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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { projectSchema } from "@/schemas/project";
import type { DialogProps } from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { Controller, useFormContext } from "react-hook-form";
import type z from "zod/v4";

type FormData = z.infer<typeof projectSchema>;

interface PredictorFormDialogProps extends DialogProps {
  headers: string[];
}

const EvaluatorFormDialog = ({
  headers,
  ...props
}: PredictorFormDialogProps) => {
  const t = useTranslations("project");
  const {
    control,
    register,
    resetField,
    watch,
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
            <DialogTitle>{t("step4.evaluator.title")}</DialogTitle>
            <DialogDescription>
              {t("step4.evaluator.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="h-[240px] space-y-12 overflow-y-auto px-6">
            {headers.slice(2).map((header, i) => (
              <div key={i.toString()} className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="font-medium">{header}</div>
                  <hr className="flex-1" />
                </div>
                <div className="space-y-8">
                  {(["series", "parallel"] as const).map((strategy, j) => {
                    const mode = watch(
                      `config.evaluator.${header}.${strategy}.mode`,
                    );

                    return (
                      <div key={j.toString()} className="grid gap-4">
                        <div className="grid gap-3">
                          <Label htmlFor={`${header}-${strategy}`}>
                            {t(`step4.evaluator.${strategy}`)}
                          </Label>
                          <Controller
                            name={`config.evaluator.${header}.${strategy}.mode`}
                            control={control}
                            render={({ field: { value, onChange } }) => (
                              <Select value={value} onValueChange={onChange}>
                                <SelectTrigger
                                  id={`${header}-${strategy}`}
                                  className="w-full"
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="top_p">
                                    {t("step4.evaluator.top_p.title")}
                                  </SelectItem>
                                  <SelectItem value="top_k">
                                    {t("step4.evaluator.top_k.title")}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        {mode === "top_p" ? (
                          <div className="grid gap-2">
                            <Label htmlFor={`${header}-${strategy}-top-p`}>
                              {t("step4.evaluator.top_p.title")}
                            </Label>
                            <div className="space-y-1">
                              <Input
                                id={`${header}-${strategy}-top-p`}
                                type="number"
                                step={0.01}
                                min={0}
                                max={1}
                                {...register(
                                  `config.evaluator.${header}.${strategy}.value`,
                                  { valueAsNumber: true },
                                )}
                              />
                              {errors.config?.evaluator?.[header]?.[strategy]
                                ?.value && (
                                <span className="px-1 text-destructive text-xs">
                                  {t(
                                    // @ts-expect-error
                                    `step4.evaluator.top_p.${errors.config.evaluator[header][strategy].value.message}`,
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="grid gap-2">
                            <Label htmlFor={`${header}-${strategy}-top-k`}>
                              {t("step4.evaluator.top_k.title")}
                            </Label>
                            <div className="space-y-1">
                              <Input
                                id={`${header}-${strategy}-top-k`}
                                type="number"
                                step={1}
                                min={1}
                                {...register(
                                  `config.evaluator.${header}.${strategy}.value`,
                                  { valueAsNumber: true },
                                )}
                              />
                              {errors.config?.evaluator?.[header]?.[strategy]
                                ?.value && (
                                <span className="px-1 text-destructive text-xs">
                                  {t(
                                    // @ts-expect-error
                                    `step4.evaluator.top_k.${errors.config.evaluator[header][strategy].value.message}`,
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="px-6">
            <Button
              variant="outline"
              onClick={() => resetField("config.evaluator")}
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

export default EvaluatorFormDialog;
