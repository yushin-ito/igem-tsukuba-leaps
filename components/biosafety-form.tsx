import SearchPathogenDialog from "@/components/search-pathogen-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { biosafetySchema, type projectSchema } from "@/schemas/project";
import type { Pathogen } from "@/types";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import * as R from "remeda";
import type z from "zod/v4";

type FormData = z.infer<typeof projectSchema>;

type BiosafetyFormProps = {
  pathogens: Pathogen[];
};

const BiosafetyForm = ({ pathogens }: BiosafetyFormProps) => {
  const t = useTranslations("project");
  const { control } = useFormContext<FormData>();

  const [open, setOpen] = useState(false);

  return (
    <>
      <ol className="list-decimal space-y-8 px-4">
        {R.keys(biosafetySchema.shape).map((item, index) => (
          <li key={index.toString()} className="space-y-3">
            <div>
              {t.rich(`step1.questions.${item}`, {
                link: (chunks) => (
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 font-normal underline underline-offset-2"
                    onClick={() => setOpen(!open)}
                  >
                    {chunks}
                  </Button>
                ),
              })}
            </div>
            <Controller
              name={`biosafety.${item}`}
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <div className="space-y-2">
                  <RadioGroup value={value} onValueChange={onChange}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id={`${item}-yes`} />
                      <Label htmlFor={`${item}-yes`} className="font-normal">
                        {t("step1.yes")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id={`${item}-no`} />
                      <Label htmlFor={`${item}-no`} className="font-normal">
                        {t("step1.no")}
                      </Label>
                    </div>
                  </RadioGroup>
                  {error?.message && (
                    <span className="text-destructive text-xs">
                      {
                        // @ts-expect-error
                        t(`step1.${error.message}`)
                      }
                    </span>
                  )}
                </div>
              )}
            />
          </li>
        ))}
      </ol>
      <SearchPathogenDialog
        open={open}
        onOpenChange={setOpen}
        pathogens={pathogens}
      />
    </>
  );
};

export default BiosafetyForm;
