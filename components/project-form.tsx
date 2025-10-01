"use client";

import DataTable from "@/components/data-table";
import DataTableColumnHeader from "@/components/data-table-column-header";
import Icons from "@/components/icons";
import SearchPathogenDialog from "@/components/search-pathogen-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import env from "@/env";
import { useDialog } from "@/hooks/use-dialog";
import { useDifference } from "@/hooks/use-difference";
import { fetcher, parseDSV } from "@/lib/utils";
import { configSchema } from "@/schemas/config";
import { confirmSchema, projectSchema, tableSchema } from "@/schemas/project";
import type { Pathogen } from "@/types";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Project, Task } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  type ChangeEvent,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Controller, useForm } from "react-hook-form";
import * as R from "remeda";
import { toast } from "sonner";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import type { z } from "zod/v4";

interface DialogPayload {
  search: undefined;
}

interface ProjectFormProps {
  project: Pick<Project, "id">;
  tasks: Task[];
  pathogens: Pathogen[];
}

type FormData = z.infer<typeof projectSchema>;

const ProjectForm = ({ project, tasks, pathogens }: ProjectFormProps) => {
  const t = useTranslations("project");
  const {
    register,
    watch,
    control,
    setValue,
    resetField,
    unregister,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: standardSchemaResolver(projectSchema),
    defaultValues: {
      text: "id,sequence,value1,value2,value3",
      config: {
        sampler: {
          num_shuffles: "100000",
          shuffle_rate: "0.04",
          window_sizes: "1, 3, 5",
        },
        predictor: {
          value1: {
            destruct_per_samples: "0",
            num_destructions: "2",
            mutate_per_samples: "150",
            num_mutations: "2",
          },
          value2: {
            destruct_per_samples: "0",
            num_destructions: "2",
            mutate_per_samples: "150",
            num_mutations: "2",
          },
          value3: {
            destruct_per_samples: "0",
            num_destructions: "2",
            mutate_per_samples: "150",
            num_mutations: "2",
          },
        },
        evaluator: {
          value1: {
            mode: "max",
            series: { top_p: "0.9" },
            parallel: { top_k: "20" },
          },
          value2: {
            mode: "max",
            series: { top_p: "0.9" },
            parallel: { top_k: "20" },
          },
          value3: {
            mode: "max",
            series: { top_p: "0.9" },
            parallel: { top_k: "20" },
          },
        },
        generator: { max_new_token: "256", prompt: "" },
        early_stopper: { num_samples: "1000", patience: "10" },
        runner: { num_iterations: "30", num_sequences: "30000" },
      },
    },
  });

  const text = watch("text");

  const { open, getDialogProps } = useDialog<DialogPayload>();

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

  const { trigger: updateTask, isMutating: isMutatingCancel } = useSWRMutation(
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
    async (url: string, { arg }: { arg: { files: File[] } }) => {
      const formData = new FormData();
      for (const file of arg.files) {
        formData.append("file", file);
      }

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

  const { headers, rows, delimiter } = useMemo(() => {
    return parseDSV(text);
  }, [text]);

  const { added, removed } = useDifference(headers.slice(2));

  useEffect(() => {
    (async () => {
      try {
        const url = `${env.NEXT_PUBLIC_BLOB_URL}/${project.id}/input.csv`;
        const response = await fetch(url);

        if (response.ok) {
          const text = await response.text();
          setValue("text", text);
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

          if (json?.evaluator) {
            json.evaluator = R.omit(json.evaluator, [
              "hamiltonian",
              "likelihood",
            ]);
          }

          if (Array.isArray(json?.sampler?.window_sizes)) {
            json.sampler.window_sizes = json.sampler.window_sizes.join(", ");
          }

          const config = configSchema.safeParse(json);

          if (config.success) {
            const values = getValues();
            reset({ ...values, config: config.data });
          }
        }
      } catch {
        toast.error(t("error.download.title"), {
          description: t("error.download.description"),
        });
      }
    })();
  }, [project.id, setValue, t, getValues, reset]);

  useEffect(() => {
    for (const header of removed) {
      unregister(`config.predictor.${header}`);
      unregister(`config.evaluator.${header}`);
    }

    for (const header of added) {
      setValue(`config.predictor.${header}`, {
        destruct_per_samples: "0",
        num_destructions: "2",
        mutate_per_samples: "150",
        num_mutations: "2",
      });

      setValue(`config.evaluator.${header}`, {
        mode: "max",
        series: { top_p: "0.9" },
        parallel: { top_k: "20" },
      });
    }
  }, [added, removed, setValue, unregister]);

  const dataset = useMemo(
    () =>
      rows.map((row) => {
        const data: Record<string, string> = {};
        for (const [index, header] of headers.entries()) {
          data[header] = row[index] ?? "";
        }
        return data;
      }),
    [rows, headers],
  );

  const columns: ColumnDef<Record<string, string>>[] = useMemo(
    () =>
      headers.map((header, index) => ({
        id: index.toString(),
        accessorKey: header,
        meta: { label: header },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={header} />
        ),
        cell: ({ getValue }) => (
          <div className="px-4">{String(getValue())}</div>
        ),
      })),
    [headers],
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const nodes = useMemo(() => {
    const lines: string[][] = headers.length ? [headers, ...rows] : rows;

    return lines.map((cells, i) => {
      if (cells[0] === "") {
        return <br key={i.toString()} />;
      }

      return (
        <Fragment key={i.toString()}>
          {cells.map((cell, j) => (
            <Fragment key={j.toString()}>
              <span
                className={
                  j % 2 === 0 ? "text-foreground" : "text-muted-foreground"
                }
              >
                {cell}
              </span>
              {j < cells.length - 1 && (
                <span
                  className={
                    j % 2 === 0 ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  {delimiter === "\t" ? "\\t" : delimiter}
                </span>
              )}
            </Fragment>
          ))}
          {i < lines.length - 1 && <br />}
        </Fragment>
      );
    });
  }, [headers, rows, delimiter]);

  const formatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 3,
  });

  const onUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      const text = await file.text();
      setValue("text", text);
    },
    [setValue],
  );

  const onSubmit = useCallback(
    async (data: FormData) => {
      const config = {
        project: project.id,

        debug: true,
        device: "cuda",
        seed: 42,

        sampler: {
          num_shuffles: Number(data.config.sampler.num_shuffles),
          shuffle_rate: Number(data.config.sampler.shuffle_rate),
          window_sizes: data.config.sampler.window_sizes
            .split(",")
            .map((value) => Number(value.trim())),
        },

        predictor: Object.fromEntries(
          Object.entries(data.config.predictor).map(([key, value]) => [
            key,
            {
              batch_size: 16,
              destruct_per_samples: Number(value.destruct_per_samples),
              model_name_or_path: "facebook/esm2_t30_150M_UR50D",
              mutate_per_samples: Number(value.mutate_per_samples),
              noise_ratio: 0.1,
              num_destructions: Number(value.num_destructions),
              num_epochs: 200,
              num_mutations: Number(value.num_mutations),
              num_trials: 30,
              patience: 20,
              test_size: 0.2,
            },
          ]),
        ),

        evaluator: {
          hamiltonian: { threshold: 5.0, mode: "min" },
          likelihood: {
            batch_size: 32,
            model_name_or_path: "westlake-repl/SaProt_650M_AF2",
            threshold: 0.0,
            mode: "max",
          },
          ...Object.fromEntries(
            Object.entries(data.config.evaluator).map(([key, value]) => {
              const object =
                value.mode === "range"
                  ? {
                      mode: "range",
                      lower: Number(value.lower),
                      upper: Number(value.upper),
                    }
                  : { mode: value.mode };

              const series =
                "top_p" in value.series
                  ? { top_p: Number(value.series.top_p) }
                  : { top_k: Number(value.series.top_k) };

              const parallel =
                "top_p" in value.parallel
                  ? { top_p: Number(value.parallel.top_p) }
                  : { top_k: Number(value.parallel.top_k) };

              return [key, { batch_size: 32, ...object, series, parallel }];
            }),
          ),
        },

        generator: {
          batch_size: 32,
          max_new_token: Number(data.config.generator.max_new_token),
          model_name_or_path: "hugohrban/progen2-small",
          num_epochs: 6,
          num_trials: 30,
          patience: 3,
          prompt: data.config.generator.prompt,
          test_size: 0.1,
        },

        early_stopper: {
          batch_size: 32,
          model_name_or_path: "facebook/esm2_t33_650M_UR50D",
          num_samples: Number(data.config.early_stopper.num_samples),
          patience: Number(data.config.early_stopper.patience),
        },

        runner: {
          num_iterations: Number(data.config.runner.num_iterations),
          num_sequences: Number(data.config.runner.num_sequences),
        },
      };

      await uploadFile({
        files: [
          new File(
            [JSON.stringify(config, null, 2)],
            `${project.id}/config.json`,
            {
              type: "application/json",
            },
          ),
          new File([text], `${project.id}/input.csv`, { type: "text/csv" }),
        ],
      });

      await insertTask({ projectId: project.id });
    },
    [insertTask, project, text, uploadFile],
  );

  const onCancel = useCallback(async () => {
    if (!data || data.length === 0) {
      return;
    }

    await updateTask({ status: "canceled" });
  }, [data, updateTask]);

  return (
    <>
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
            <AccordionContent className="space-y-8 p-1 pb-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="font-medium text-base">
                      {t("step1.question.title")}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {t("step1.question.description")}
                    </div>
                  </div>
                  <hr />
                </div>
                <ol className="list-decimal space-y-6 px-4">
                  {R.keys(confirmSchema.shape.question.shape).map(
                    (item, index) => (
                      <li key={index.toString()} className="space-y-3">
                        <div>
                          {t.rich(`step1.question.items.${item}`, {
                            link: (chunks) => (
                              <Button
                                type="button"
                                variant="link"
                                className="p-0 font-normal underline underline-offset-2"
                                onClick={() =>
                                  open({ type: "search", data: undefined })
                                }
                              >
                                {chunks}
                              </Button>
                            ),
                          })}
                        </div>
                        <Controller
                          name={`confirm.question.${item}`}
                          control={control}
                          render={({
                            field: { value, onChange },
                            fieldState: { error },
                          }) => (
                            <div className="space-y-2">
                              <RadioGroup
                                value={value}
                                onValueChange={onChange}
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="yes"
                                    id={`${item}-yes`}
                                  />
                                  <Label
                                    htmlFor={`${item}-yes`}
                                    className="font-normal"
                                  >
                                    {t("step1.question.yes")}
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="no"
                                    id={`${item}-no`}
                                  />
                                  <Label
                                    htmlFor={`${item}-no`}
                                    className="font-normal"
                                  >
                                    {t("step1.question.no")}
                                  </Label>
                                </div>
                              </RadioGroup>
                              {error?.message && (
                                <span className="text-destructive text-xs">
                                  {/* @ts-expect-error */}
                                  {t(`step1.question.${error.message}`)}
                                </span>
                              )}
                            </div>
                          )}
                        />
                      </li>
                    ),
                  )}
                </ol>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="font-medium text-base">
                      {t("step1.consent.title")}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {t("step1.consent.description")}
                    </div>
                  </div>
                  <hr />
                </div>
                <div className="space-y-8">
                  {R.keys(confirmSchema.shape.consent.shape).map(
                    (key, index) => (
                      <Controller
                        key={key}
                        name={`confirm.consent.${key}`}
                        control={control}
                        render={({
                          field: { value, onChange },
                          fieldState: { error },
                        }) => (
                          <div className="space-y-2">
                            <div
                              key={index.toString()}
                              className="flex items-start space-x-2"
                            >
                              <Checkbox
                                id={key}
                                checked={value}
                                onCheckedChange={onChange}
                              />
                              <div className="space-y-2">
                                <Label htmlFor={key}>
                                  {t(`step1.consent.items.${key}.title`)}
                                </Label>
                                <p className="text-muted-foreground text-sm">
                                  {t(`step1.consent.items.${key}.description`)}
                                </p>
                              </div>
                            </div>
                            {error?.message && (
                              <span className="text-destructive text-xs">
                                {/* @ts-expect-error */}
                                {t(`step1.consent.${error.message}`)}
                              </span>
                            )}
                          </div>
                        )}
                      />
                    ),
                  )}
                </div>
              </div>
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
                  <div className="relative rounded-md border border-input focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                    <pre
                      ref={preRef}
                      className="absolute inset-0 overflow-auto whitespace-pre px-3 py-2 font-mono text-sm"
                    >
                      <code className="leading-relaxed">{nodes}</code>
                    </pre>
                    <Textarea
                      {...register("text")}
                      placeholder={[
                        "id",
                        "sequence",
                        "value1",
                        "value2",
                        "value3",
                      ].join(delimiter)}
                      className="no-scrollbar relative h-[320px] resize-none overflow-auto whitespace-pre rounded-none border-none font-mono text-sm text-transparent leading-relaxed caret-foreground shadow-none focus-visible:ring-0"
                      ref={(event) => {
                        textareaRef.current = event;
                        register("text").ref(event);
                      }}
                      onScroll={(event) => {
                        if (!preRef.current) {
                          return;
                        }

                        preRef.current.scrollTop =
                          event.currentTarget.scrollTop;
                        preRef.current.scrollLeft =
                          event.currentTarget.scrollLeft;
                      }}
                    />
                  </div>
                  {errors.text && (
                    <span className="px-1 text-destructive text-xs">
                      {/* @ts-expect-error */}
                      {t(`step2.${errors.text.message}`)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <Button variant="outline" onClick={() => resetField("text")}>
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
              {tableSchema.safeParse({ headers }).success && (
                <DataTable columns={columns} data={dataset} />
              )}
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
              {(headers.length > 2
                ? headers.slice(2)
                : ["value1", "value2", "value3"]
              ).map((header, index) => {
                const values = rows.map((row) => Number(row[index + 2]));
                const stats = {
                  min: values.length ? Math.min(...values) : null,
                  max: values.length ? Math.max(...values) : null,
                  mean: R.mean(values) ?? null,
                  median: R.median(values) ?? null,
                };

                return (
                  <div key={index.toString()} className="space-y-8">
                    <div className="flex items-center justify-between space-x-4 px-2">
                      <div className="space-y-1">
                        <div className="font-medium text-base">{header}</div>
                        <div className="text-muted-foreground text-sm">
                          {R.entries(stats)
                            .map(([key, value]) => {
                              return t(`step3.${key}`, {
                                value:
                                  value == null ? "-" : formatter.format(value),
                              });
                            })
                            .join(" / ")}
                        </div>
                      </div>
                      <Controller
                        name={`config.evaluator.${header}`}
                        control={control}
                        render={({ field: { value, onChange } }) => {
                          return (
                            <div className="flex flex-col items-end space-y-2">
                              <div className="flex flex-col items-center space-y-2">
                                <Select
                                  value={value.mode}
                                  onValueChange={(mode) => {
                                    if (mode === "range") {
                                      onChange({
                                        ...value,
                                        mode,
                                        lower: (stats.min ?? 0).toString(),
                                        upper: (stats.max ?? 100).toString(),
                                      });
                                    } else {
                                      onChange({ ...value, mode });
                                    }
                                  }}
                                  disabled={headers.slice(2).length < 1}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue
                                      placeholder={t("step3.direction")}
                                    />
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
                                {value.mode === "range" ? (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <div className="text-muted-foreground text-sm hover:text-foreground">{`${value.lower} - ${value.upper}`}</div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                      <div className="grid gap-2">
                                        <div className="grid grid-cols-3 items-center gap-12">
                                          <Label htmlFor="upper">
                                            {t("step3.upper")}
                                          </Label>
                                          <Input
                                            id="upper"
                                            type="number"
                                            value={value.upper}
                                            onChange={(event) => {
                                              onChange({
                                                ...value,
                                                upper: event.target.value,
                                              });
                                            }}
                                            className="col-span-2 h-8"
                                          />
                                        </div>
                                        <div className="grid grid-cols-3 items-center gap-12">
                                          <Label htmlFor="lower">
                                            {t("step3.lower")}
                                          </Label>
                                          <Input
                                            id="lower"
                                            type="number"
                                            value={value.lower}
                                            onChange={(event) =>
                                              onChange({
                                                ...value,
                                                lower: event.target.value,
                                              })
                                            }
                                            className="col-span-2 h-8"
                                          />
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                ) : (
                                  <div className="text-muted-foreground text-sm capitalize">
                                    {`${value.mode}imize`}
                                  </div>
                                )}
                              </div>
                              {/* @ts-expect-error */}
                              {errors.config?.evaluator?.[header]?.upper && (
                                <span className="text-destructive text-xs">
                                  {t(
                                    // @ts-expect-error
                                    `step3.${errors.config?.evaluator?.[header]?.upper.message}`,
                                  )}
                                </span>
                              )}
                              {/* @ts-expect-error */}
                              {errors.config?.evaluator?.[header]?.lower && (
                                <span className="text-destructive text-xs">
                                  {t(
                                    // @ts-expect-error
                                    `step3.${errors.config?.evaluator?.[header]?.lower.message}`,
                                  )}
                                </span>
                              )}
                            </div>
                          );
                        }}
                      />
                    </div>
                    {index < headers.slice(2).length - 1 && <hr />}
                  </div>
                );
              })}
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
            <AccordionContent className="space-y-8 p-1 pb-8">
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
                  <Dialog>
                    <div className="flex flex-col items-end space-y-2">
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Icons.settings />
                          {t("step4.configure")}
                        </Button>
                      </DialogTrigger>
                      {errors.config?.sampler && (
                        <span className="text-destructive text-xs">
                          {t("step4.error")}
                        </span>
                      )}
                    </div>
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
                              {t("step4.sampler.num_shuffles.title")}
                            </Label>
                            <div className="space-y-1">
                              <Input
                                id="num-shuffles"
                                type="number"
                                {...register("config.sampler.num_shuffles")}
                              />
                              {errors.config?.sampler?.num_shuffles && (
                                <span className="px-1 text-destructive text-xs">
                                  {t(
                                    // @ts-expect-error
                                    `step4.sampler.num_shuffles.${errors.config.sampler.num_shuffles.message}`,
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
                                {...register("config.sampler.shuffle_rate")}
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
                </div>
                <hr />
              </div>
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
                  <Dialog>
                    <div className="flex flex-col items-end space-y-2">
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Icons.settings />
                          {t("step4.configure")}
                        </Button>
                      </DialogTrigger>
                      {errors.config?.predictor && (
                        <span className="text-destructive text-xs">
                          {t("step4.error")}
                        </span>
                      )}
                    </div>
                    <DialogContent className="px-0">
                      <div className="space-y-8">
                        <DialogHeader className="px-6">
                          <DialogTitle>
                            {t("step4.predictor.title")}
                          </DialogTitle>
                          <DialogDescription>
                            {t("step4.predictor.description")}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="h-[240px] space-y-12 overflow-y-auto px-6">
                          {(headers.length > 2
                            ? headers.slice(2)
                            : ["value1", "value2", "value3"]
                          ).map((header, index) => (
                            <div key={index.toString()} className="space-y-4">
                              <div className="flex items-center space-x-4">
                                <div className="font-medium">{header}</div>
                                <hr className="flex-1" />
                              </div>
                              <Controller
                                name={`config.predictor.${header}`}
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                  <div className="grid gap-4">
                                    <div className="grid gap-3">
                                      <Label htmlFor="destruct_per_samples">
                                        {t(
                                          "step4.predictor.destruct_per_samples.title",
                                        )}
                                      </Label>
                                      <div className="space-y-1">
                                        <Input
                                          id="destruct_per_samples"
                                          type="number"
                                          value={value.destruct_per_samples}
                                          onChange={(event) =>
                                            onChange({
                                              ...value,
                                              destruct_per_samples:
                                                event.target.value,
                                            })
                                          }
                                        />
                                        {errors.config?.predictor?.[header]
                                          ?.destruct_per_samples && (
                                          <span className="px-1 text-destructive text-xs">
                                            {t(
                                              // @ts-expect-error
                                              `step4.predictor.destruct_per_samples.${errors.config.predictor[header].destruct_per_samples.message}`,
                                            )}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="grid gap-3">
                                      <Label htmlFor="num-destructions">
                                        {t(
                                          "step4.predictor.num_destructions.title",
                                        )}
                                      </Label>
                                      <div className="space-y-1">
                                        <Input
                                          id="num-destructions"
                                          type="number"
                                          value={value.num_destructions}
                                          onChange={(event) =>
                                            onChange({
                                              ...value,
                                              num_destructions:
                                                event.target.value,
                                            })
                                          }
                                        />
                                        {errors.config?.predictor?.[header]
                                          ?.num_destructions && (
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
                                      <Label htmlFor="mutate-per-samples">
                                        {t(
                                          "step4.predictor.mutate_per_samples.title",
                                        )}
                                      </Label>
                                      <div className="space-y-1">
                                        <Input
                                          id="mutate-per-samples"
                                          type="number"
                                          value={value.mutate_per_samples}
                                          onChange={(event) =>
                                            onChange({
                                              ...value,
                                              mutate_per_samples:
                                                event.target.value,
                                            })
                                          }
                                        />
                                        {errors.config?.predictor?.[header]
                                          ?.mutate_per_samples && (
                                          <span className="px-1 text-destructive text-xs">
                                            {t(
                                              // @ts-expect-error
                                              `step4.predictor.mutate_per_samples.${errors.config.predictor[header].mutate_per_samples.message}`,
                                            )}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="grid gap-3">
                                      <Label htmlFor="num-mutations">
                                        {t(
                                          "step4.predictor.num_mutations.title",
                                        )}
                                      </Label>
                                      <div className="space-y-1">
                                        <Input
                                          id="num-mutations"
                                          type="number"
                                          value={value.num_mutations}
                                          onChange={(event) =>
                                            onChange({
                                              ...value,
                                              num_mutations: event.target.value,
                                            })
                                          }
                                        />
                                        {errors.config?.predictor?.[header]
                                          ?.num_mutations && (
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
                                )}
                              />
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
                </div>
                <hr />
              </div>
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
                  <Dialog>
                    <div className="flex flex-col items-end space-y-2">
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Icons.settings />
                          {t("step4.configure")}
                        </Button>
                      </DialogTrigger>
                      {errors.config?.evaluator && (
                        <span className="text-destructive text-xs">
                          {t("step4.error")}
                        </span>
                      )}
                    </div>
                    <DialogContent className="px-0">
                      <div className="space-y-8">
                        <DialogHeader className="px-6">
                          <DialogTitle>
                            {t("step4.evaluator.title")}
                          </DialogTitle>
                          <DialogDescription>
                            {t("step4.evaluator.description")}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="h-[240px] space-y-12 overflow-y-auto px-6">
                          {(headers.length > 2
                            ? headers.slice(2)
                            : ["value1", "value2", "value3"]
                          ).map((header, index) => (
                            <div key={index.toString()} className="space-y-4">
                              <div className="flex items-center space-x-4">
                                <div className="font-medium">{header}</div>
                                <hr className="flex-1" />
                              </div>
                              {(["series", "parallel"] as const).map(
                                (strategy) => (
                                  <Controller
                                    key={strategy}
                                    name={`config.evaluator.${header}.${strategy}`}
                                    control={control}
                                    render={({
                                      field: { value, onChange },
                                    }) => (
                                      <div className="grid gap-4">
                                        <div className="grid gap-3">
                                          <Label htmlFor={strategy}>
                                            {t(`step4.evaluator.${strategy}`)}
                                          </Label>
                                          <Select
                                            value={
                                              "top_p" in value
                                                ? "top_p"
                                                : "top_k"
                                            }
                                            onValueChange={(mode) => {
                                              if (mode === "top_p") {
                                                onChange({
                                                  top_p:
                                                    "top_p" in value
                                                      ? value.top_p
                                                      : 0.9,
                                                });
                                              } else {
                                                onChange({
                                                  top_k:
                                                    "top_k" in value
                                                      ? value.top_k
                                                      : 20,
                                                });
                                              }
                                            }}
                                          >
                                            <SelectTrigger
                                              id={strategy}
                                              className="w-full"
                                            >
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="top_p">
                                                {t(
                                                  "step4.evaluator.top_p.title",
                                                )}
                                              </SelectItem>
                                              <SelectItem value="top_k">
                                                {t(
                                                  "step4.evaluator.top_k.title",
                                                )}
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        {"top_p" in value ? (
                                          <div className="grid gap-2">
                                            <Label htmlFor="top-p">
                                              {t("step4.evaluator.top_p.title")}
                                            </Label>
                                            <div className="space-y-1">
                                              <Input
                                                id="top-p"
                                                type="number"
                                                step="0.01"
                                                min={0}
                                                max={1}
                                                value={value.top_p}
                                                onChange={(event) =>
                                                  onChange({
                                                    top_p: event.target.value,
                                                  })
                                                }
                                              />
                                              {errors.config?.evaluator?.[
                                                header
                                                // @ts-expect-error
                                              ]?.[strategy]?.top_p && (
                                                <span className="px-1 text-destructive text-xs">
                                                  {t(
                                                    // @ts-expect-error
                                                    `step4.evaluator.top_p.${errors.config.evaluator[header][strategy].top_p.message}`,
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="grid gap-2">
                                            <Label htmlFor="top-k">
                                              {t("step4.evaluator.top_k.title")}
                                            </Label>
                                            <div className="space-y-1">
                                              <Input
                                                id="top-k"
                                                type="number"
                                                min={1}
                                                value={value.top_k}
                                                onChange={(event) =>
                                                  onChange({
                                                    top_k: event.target.value,
                                                  })
                                                }
                                              />
                                              {errors.config?.evaluator?.[
                                                header
                                                // @ts-expect-error
                                              ]?.[strategy]?.top_k && (
                                                <span className="px-1 text-destructive text-xs">
                                                  {t(
                                                    // @ts-expect-error
                                                    `step4.evaluator.top_k.${errors.config.evaluator[header][strategy].top_k.message}`,
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  />
                                ),
                              )}
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
                </div>
                <hr />
              </div>
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
                  <Dialog>
                    <div className="flex flex-col items-end space-y-2">
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Icons.settings />
                          {t("step4.configure")}
                        </Button>
                      </DialogTrigger>
                      {errors.config?.generator && (
                        <span className="text-destructive text-xs">
                          {t("step4.error")}
                        </span>
                      )}
                    </div>
                    <DialogContent>
                      <div className="space-y-8">
                        <DialogHeader>
                          <DialogTitle>
                            {t("step4.generator.title")}
                          </DialogTitle>
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
                              <Input
                                id="prompt"
                                {...register("config.generator.prompt")}
                              />
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
                  <Dialog>
                    <div className="flex flex-col items-end space-y-2">
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Icons.settings />
                          {t("step4.configure")}
                        </Button>
                      </DialogTrigger>
                      {errors.config?.early_stopper && (
                        <span className="text-destructive text-xs">
                          {t("step4.error")}
                        </span>
                      )}
                    </div>
                    <DialogContent>
                      <div className="space-y-8">
                        <DialogHeader>
                          <DialogTitle>
                            {t("step4.early_stopper.title")}
                          </DialogTitle>
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
                                {...register(
                                  "config.early_stopper.num_samples",
                                )}
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
                                {...register("config.early_stopper.patience")}
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
                <Dialog>
                  <div className="flex flex-col items-end space-y-2">
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Icons.settings />
                        {t("step4.configure")}
                      </Button>
                    </DialogTrigger>
                    {errors.config?.runner && (
                      <span className="text-destructive text-xs">
                        {t("step4.error")}
                      </span>
                    )}
                  </div>
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
                              {...register("config.runner.num_iterations")}
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
                              {...register("config.runner.num_sequences")}
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
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" size="lg">
            {t("save")}
          </Button>
          {isActive ? (
            <Button type="button" size="lg" onClick={onCancel}>
              {isMutatingCancel ? (
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
      <SearchPathogenDialog
        {...getDialogProps("search")}
        pathogens={pathogens}
      />
    </>
  );
};

export default ProjectForm;
