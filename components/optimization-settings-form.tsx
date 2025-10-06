import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { projectSchema } from "@/schemas/project";
import { useTranslations } from "next-intl";
import { Controller, useFormContext } from "react-hook-form";
import * as R from "remeda";
import type z from "zod/v4";

type FormData = z.infer<typeof projectSchema>;

interface OptimizationSettingsFormProps {
  headers: string[];
  rows: string[][];
}

const OptimizationSettingsForm = ({
  headers,
  rows,
}: OptimizationSettingsFormProps) => {
  const t = useTranslations("project");
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<FormData>();

  const formatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 3,
  });

  if (headers.length < 3) {
    return null;
  }

  return (
    <>
      {headers.slice(2).map((header, index) => {
        const values = rows.map((row) => Number(row[index + 2]));
        const stats = {
          min: values.length ? Math.min(...values) : null,
          max: values.length ? Math.max(...values) : null,
          mean: R.mean(values) ?? null,
          median: R.median(values) ?? null,
        };

        const mode = watch(`config.evaluator.${header}.mode`);
        const lower =
          watch(`config.evaluator.${header}.lower`) ?? stats.min ?? Number.NaN;
        const upper =
          watch(`config.evaluator.${header}.upper`) ?? stats.max ?? Number.NaN;

        return (
          <div key={index.toString()} className="space-y-8">
            <div className="flex items-center justify-between space-x-4 px-2">
              <div className="space-y-1">
                <div className="font-medium text-base">{header}</div>
                <div className="text-muted-foreground text-sm">
                  {R.entries(stats)
                    .map(([key, value]) => {
                      return t(`step3.${key}`, {
                        value: value == null ? "-" : formatter.format(value),
                      });
                    })
                    .join(" / ")}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="flex flex-col items-center space-y-2">
                  <Controller
                    name={`config.evaluator.${header}.mode`}
                    control={control}
                    render={({ field: { value, onChange } }) => {
                      return (
                        <Select value={value} onValueChange={onChange}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder={t("step3.direction")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="max">
                              {t("step3.maximize")}
                            </SelectItem>
                            <SelectItem value="min">
                              {t("step3.minimize")}
                            </SelectItem>
                            <SelectItem value="range">
                              {t("step3.range")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                  {mode === "range" ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="text-muted-foreground text-sm hover:text-foreground">{`${lower} - ${upper}`}</div>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="upper">{t("step3.upper")}</Label>
                            <div className="w-2/3 space-y-1">
                              <Input
                                id="upper"
                                type="number"
                                className="h-8"
                                {...register(
                                  `config.evaluator.${header}.upper`,
                                  {
                                    valueAsNumber: true,
                                  },
                                )}
                                defaultValue={stats.max ?? Number.NaN}
                              />
                              {
                                // @ts-expect-error
                                errors.config?.evaluator?.[header]?.upper && (
                                  <span className="text-destructive text-xs">
                                    {t(
                                      // @ts-expect-error
                                      `step3.${errors.config?.evaluator?.[header]?.upper.message}`,
                                    )}
                                  </span>
                                )
                              }
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="lower">{t("step3.lower")}</Label>
                            <div className="w-2/3 space-y-1">
                              <Input
                                id="lower"
                                type="number"
                                className="h-8"
                                {...register(
                                  `config.evaluator.${header}.lower`,
                                  {
                                    valueAsNumber: true,
                                  },
                                )}
                                defaultValue={stats.min ?? Number.NaN}
                              />
                              {
                                // @ts-expect-error
                                errors.config?.evaluator?.[header]?.lower && (
                                  <span className="text-destructive text-xs">
                                    {t(
                                      // @ts-expect-error
                                      `step3.${errors.config?.evaluator?.[header]?.lower.message}`,
                                    )}
                                  </span>
                                )
                              }
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    mode && (
                      <div className="text-muted-foreground text-sm capitalize">
                        {`${mode}imize`}
                      </div>
                    )
                  )}
                </div>
                {
                  // @ts-expect-error
                  (errors.config?.evaluator?.[header]?.upper ||
                    // @ts-expect-error
                    errors.config?.evaluator?.[header]?.lower) && (
                    <span className="text-destructive text-xs">
                      {t("step3.error")}
                    </span>
                  )
                }
              </div>
            </div>
            {index < headers.length - 3 && <hr />}
          </div>
        );
      })}
    </>
  );
};

export default OptimizationSettingsForm;
