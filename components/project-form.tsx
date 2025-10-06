"use client";

import AdvancedSettingsForm from "@/components/advanced-settings-form";
import AssayTable from "@/components/assay-table";
import InformationDisclosureForm from "@/components/biosafety-form";
import DSVInput from "@/components/dsv-input";
import Icons from "@/components/icons";
import OptimizationSettingsForm from "@/components/optimization-settings-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import env from "@/env";
import { fetcher, parseDSV } from "@/lib/utils";
import { configSchema } from "@/schemas/config";
import { projectSchema } from "@/schemas/project";
import type { Pathogen } from "@/types";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Project, Task } from "@prisma/client";
import { useTranslations } from "next-intl";
import { type ChangeEvent, useCallback, useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as R from "remeda";
import { toast } from "sonner";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import type { z } from "zod/v4";

interface ProjectFormProps {
  project: Pick<Project, "id">;
  tasks: Task[];
  pathogens: Pathogen[];
}

type FormData = z.infer<typeof projectSchema>;

const ProjectForm = ({ project, tasks, pathogens }: ProjectFormProps) => {
  const t = useTranslations("project");
  const methods = useForm<FormData>({
    resolver: standardSchemaResolver(projectSchema),
    defaultValues: {
      dataset: "id,sequence,value1,value2,value3",
      config: {
        sampler: {
          num_sequences: 100000,
          shuffle_rate: 0.04,
          window_sizes: "1, 3, 5",
        },
        predictor: R.mapToObj(["value1", "value2", "value3"], (key) => [
          key,
          { num_destructions: 2, num_mutations: 2 },
        ]),
        evaluator: R.mapToObj(["value1", "value2", "value3"], (key) => [
          key,
          {
            mode: "max",
            series: { mode: "top_p", value: 0.9 },
            parallel: { mode: "top_k", value: 20 },
          },
        ]),
        generator: { max_new_token: 256, prompt: "" },
        early_stopper: { num_samples: 1000, patience: 10 },
        runner: { num_iterations: 30, num_sequences: 30000 },
      },
    },
  });

  const {
    register,
    watch,
    setValue,
    resetField,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = methods;

  const dataset = watch("dataset");

  const { data, mutate } = useSWR<Task[]>(
    `/api/tasks?projectId=${project.id}`,
    fetcher,
    {
      fallbackData: tasks,
      refreshInterval: (data) => {
        if (!data || data.length === 0) {
          return 0;
        }

        const status = data[0].status;
        const isActive = status === "pending" || status === "running";

        return isActive ? 2000 : 0;
      },
    },
  );

  const isActive = useMemo(() => {
    if (!data || data.length === 0) {
      return false;
    }

    const status = data[0].status;
    return status === "pending" || status === "running";
  }, [data]);

  const { trigger: insertTask } = useSWRMutation(
    "/api/tasks",
    async (url: string, { arg }: { arg: { projectId: string } }) => {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ projectId: arg.projectId }),
      });

      return await response.json();
    },
    {
      onSuccess: () => {
        mutate();
        toast.success(t("success.run.title"), {
          description: t("success.run.description"),
        });
      },

      onError: () =>
        toast.error(t("error.run.title"), {
          description: t("error.run.description"),
        }),
    },
  );

  const { trigger: updateTask, isMutating: isMutatingUpdateTask } =
    useSWRMutation(
      data?.[0] ? `/api/tasks/${data[0].id}` : null,
      async (url: string, { arg }: { arg: Partial<Task> }) => {
        const response = await fetch(url, {
          method: "PATCH",
          body: JSON.stringify({ status: arg.status }),
        });

        return await response.json();
      },
      {
        onSuccess: () => mutate(),
        onError: () =>
          toast.error(t("error.upload.title"), {
            description: t("error.upload.description"),
          }),
      },
    );

  const { trigger: uploadFile } = useSWRMutation(
    "/api/upload",
    async (url: string, { arg }: { arg: { file: File } }) => {
      const formData = new FormData();
      formData.append("file", arg.file);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      return await response.json();
    },
    {
      onError: () =>
        toast.error(t("error.upload.title"), {
          description: t("error.upload.description"),
        }),
    },
  );

  const { headers, rows, delimiter } = useMemo(
    () => parseDSV(dataset),
    [dataset],
  );

  useEffect(() => {
    (async () => {
      try {
        const url = `${env.NEXT_PUBLIC_BLOB_URL}/${project.id}/input.csv`;
        const response = await fetch(url);

        if (response.ok) {
          const text = await response.text();
          setValue("dataset", text);
        }
      } catch {
        toast.error(t("error.download.title"), {
          description: t("error.download.description"),
        });
      }

      try {
        const url = `${env.NEXT_PUBLIC_BLOB_URL}/${project.id}/config.json`;
        const response = await fetch(url);

        if (response.ok) {
          const json = await response.json();
          const config = configSchema.parse(json);
          setValue("config", config);
        }
      } catch {
        toast.error(t("error.download.title"), {
          description: t("error.download.description"),
        });
      }
    })();
  }, [project.id, setValue, t]);

  useEffect(() => {
    const predictor = R.mapToObj(headers.slice(2), (key) => [
      key,
      { num_destructions: 2, num_mutations: 2 } as const,
    ]);
    setValue("config.predictor", predictor);

    const evaluator = R.mapToObj(headers.slice(2), (key) => [
      key,
      {
        mode: "max",
        series: { mode: "top_p", value: 0.9 },
        parallel: { mode: "top_k", value: 20 },
      } as const,
    ]);
    setValue("config.evaluator", evaluator);
  }, [headers, setValue]);

  const onUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      const text = await file.text();
      setValue("dataset", text);
    },
    [setValue],
  );

  const onSubmit = useCallback(
    async (data: FormData) => {
      await uploadFile({
        file: new File(
          [JSON.stringify(data.config, null, 2)],
          `${project.id}/config.json`,
          {
            type: "application/json",
          },
        ),
      });
      await uploadFile({
        file: new File([data.dataset], `${project.id}/input.csv`, {
          type: "text/csv",
        }),
      });

      await insertTask({ projectId: project.id });
    },
    [insertTask, project, uploadFile],
  );

  const onCancel = useCallback(async () => {
    await updateTask({ status: "canceled" });
  }, [updateTask]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        <Accordion
          type="multiple"
          className="space-y-4"
          defaultValue={["item-1", "item-2", "item-3"]}
        >
          <AccordionItem value="item-1" className="space-y-2">
            <AccordionTrigger className="items-center hover:no-underline">
              <div className="space-y-1 px-1">
                <h2 className="font-semibold md:text-lg">{t("step1.title")}</h2>
                <p className="font-normal text-muted-foreground text-sm">
                  {t("step1.description")}
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-1 pb-8">
              <InformationDisclosureForm pathogens={pathogens} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="space-y-4">
            <AccordionTrigger className="items-center hover:no-underline">
              <div className="space-y-1 px-1">
                <h2 className="font-semibold md:text-lg">{t("step2.title")}</h2>
                <p className="font-normal text-muted-foreground text-sm">
                  {t("step2.description")}
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-12 p-1 pb-8">
              <div className="space-y-6">
                <div className="space-y-1">
                  <DSVInput
                    headers={headers}
                    rows={rows}
                    delimiter={delimiter}
                    {...register("dataset")}
                  />
                  {errors.dataset && (
                    <span className="px-1 text-destructive text-xs">
                      {
                        // @ts-expect-error
                        t(`step2.${errors.dataset.message}`)
                      }
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => resetField("dataset")}
                  >
                    {t("step2.clear")}
                  </Button>
                  <div className={buttonVariants()}>
                    <Label htmlFor="dataset">{t("step2.upload")}</Label>
                    <Input
                      id="dataset"
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={onUpload}
                    />
                  </div>
                </div>
              </div>
              <AssayTable headers={headers} rows={rows} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="space-y-4">
            <AccordionTrigger className="items-center hover:no-underline">
              <div className="space-y-1 px-1">
                <h2 className="font-semibold md:text-lg">{t("step3.title")}</h2>
                <p className="font-normal text-muted-foreground text-sm">
                  {t("step3.description")}
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-8 p-1 pb-8">
              <OptimizationSettingsForm headers={headers} rows={rows} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4" className="space-y-4">
            <AccordionTrigger className="items-center hover:no-underline">
              <div className="space-y-1 px-1">
                <h2 className="font-semibold md:text-lg">{t("step4.title")}</h2>
                <p className="font-normal text-muted-foreground text-sm">
                  {t("step4.description")}
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-1 pb-8">
              <AdvancedSettingsForm headers={headers} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" size="lg">
            {t("save")}
          </Button>
          {isActive ? (
            <Button type="button" size="lg" onClick={onCancel}>
              {isMutatingUpdateTask ? (
                <Icons.spinner className="animate-spin" />
              ) : (
                <>
                  <Icons.pause />
                  {t("pause")}
                </>
              )}
            </Button>
          ) : (
            <Button type="submit" size="lg">
              {isSubmitting ? (
                <Icons.spinner className="animate-spin" />
              ) : (
                <>
                  <Icons.play />
                  {t("run")}
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
};

export default ProjectForm;
