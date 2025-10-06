import EarlyStopperFormDialog from "@/components/early-stopper-form-dialog";
import EvaluatorFormDialog from "@/components/evaluator-form-dialog";
import GeneratorFormDialog from "@/components/generator-form-dialog";
import Icons from "@/components/icons";
import PredictorFormDialog from "@/components/predictor-form-dialog";
import RunnerFormDialog from "@/components/runner-form-dialog";
import SamplerFormDialog from "@/components/sampler-form-dialog";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import type { projectSchema } from "@/schemas/project";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import type z from "zod/v4";

interface DialogPayload {
  sampler: undefined;
  predictor: undefined;
  evaluator: undefined;
  generator: undefined;
  early_stopper: undefined;
  runner: undefined;
}

type FormData = z.infer<typeof projectSchema>;

interface AdvancedSettingsFormProps {
  headers: string[];
}

const AdvancedSettingsForm = ({ headers }: AdvancedSettingsFormProps) => {
  const t = useTranslations("project");
  const {
    formState: { errors },
  } = useFormContext<FormData>();

  const { open, getDialogProps } = useDialog<DialogPayload>();

  return (
    <>
      <div className="space-y-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between space-x-4 px-2">
            <div className="space-y-1">
              <div className="font-medium text-base">
                {t("step4.sampler.title")}
              </div>
              <div className="text-muted-foreground text-sm">
                {t("step4.sampler.description")}
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => open({ type: "sampler", data: undefined })}
              >
                <Icons.settings />
                {t("step4.configure")}
              </Button>
              {errors.config?.sampler && (
                <span className="text-destructive text-xs">
                  {t("step4.error")}
                </span>
              )}
            </div>
          </div>
          <hr />
        </div>
        {headers.length > 2 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between space-x-4 px-2">
              <div className="space-y-1">
                <div className="font-medium text-base">
                  {t("step4.predictor.title")}
                </div>
                <div className="text-muted-foreground text-sm">
                  {t("step4.predictor.description")}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => open({ type: "predictor", data: undefined })}
                >
                  <Icons.settings />
                  {t("step4.configure")}
                </Button>
                {errors.config?.predictor && (
                  <span className="text-destructive text-xs">
                    {t("step4.error")}
                  </span>
                )}
              </div>
            </div>
            <hr />
          </div>
        )}
        {headers.length > 2 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between space-x-4 px-2">
              <div className="space-y-1">
                <div className="font-medium text-base">
                  {t("step4.evaluator.title")}
                </div>
                <div className="text-muted-foreground text-sm">
                  {t("step4.evaluator.description")}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => open({ type: "evaluator", data: undefined })}
                >
                  <Icons.settings />
                  {t("step4.configure")}
                </Button>
                {errors.config?.evaluator && (
                  <span className="text-destructive text-xs">
                    {t("step4.error")}
                  </span>
                )}
              </div>
            </div>
            <hr />
          </div>
        )}
        <div className="space-y-8">
          <div className="flex items-center justify-between space-x-4 px-2">
            <div className="space-y-1">
              <div className="font-medium text-base">
                {t("step4.generator.title")}
              </div>
              <div className="text-muted-foreground text-sm">
                {t("step4.generator.description")}
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => open({ type: "generator", data: undefined })}
              >
                <Icons.settings />
                {t("step4.configure")}
              </Button>
              {errors.config?.generator && (
                <span className="text-destructive text-xs">
                  {t("step4.error")}
                </span>
              )}
            </div>
          </div>
          <hr />
        </div>
        <div className="space-y-8">
          <div className="flex items-center justify-between space-x-4 px-2">
            <div className="space-y-1">
              <div className="font-medium text-base">
                {t("step4.early_stopper.title")}
              </div>
              <div className="text-muted-foreground text-sm">
                {t("step4.early_stopper.description")}
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => open({ type: "early_stopper", data: undefined })}
              >
                <Icons.settings />
                {t("step4.configure")}
              </Button>
              {errors.config?.early_stopper && (
                <span className="text-destructive text-xs">
                  {t("step4.error")}
                </span>
              )}
            </div>
          </div>
          <hr />
        </div>
        <div className="flex items-center justify-between space-x-4 px-2">
          <div className="space-y-1">
            <div className="font-medium text-base">
              {t("step4.runner.title")}
            </div>
            <div className="text-muted-foreground text-sm">
              {t("step4.runner.description")}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => open({ type: "runner", data: undefined })}
            >
              <Icons.settings />
              {t("step4.configure")}
            </Button>
            {errors.config?.runner && (
              <span className="text-destructive text-xs">
                {t("step4.error")}
              </span>
            )}
          </div>
        </div>
      </div>
      <SamplerFormDialog {...getDialogProps("sampler")} />
      <PredictorFormDialog {...getDialogProps("predictor")} headers={headers} />
      <EvaluatorFormDialog {...getDialogProps("evaluator")} headers={headers} />
      <GeneratorFormDialog {...getDialogProps("generator")} />
      <EarlyStopperFormDialog {...getDialogProps("early_stopper")} />
      <RunnerFormDialog {...getDialogProps("runner")} />
    </>
  );
};

export default AdvancedSettingsForm;
