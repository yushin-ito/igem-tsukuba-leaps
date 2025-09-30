import Icons from "@/components/icons";
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
import { renameSchema } from "@/schemas/project";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Project } from "@prisma/client";
import type { DialogProps } from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
import type { z } from "zod/v4";

type FormData = z.infer<typeof renameSchema>;

interface ProjectRenameDialogProps extends DialogProps {
  name: string;
  projectId: string;
}

const ProjectRenameDialog = ({
  name,
  projectId,
  ...props
}: ProjectRenameDialogProps) => {
  const t = useTranslations("project");
  const { mutate } = useSWRConfig();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormData>({
    resolver: standardSchemaResolver(renameSchema),
  });

  useEffect(() => {
    setValue("name", name);
  }, [name, setValue]);

  const { trigger: updateProject } = useSWRMutation(
    `/api/projects/${encodeURIComponent(projectId)}`,
    async (url: string, { arg }: { arg: Partial<Project> }) => {
      const response = await fetch(url, {
        method: "PATCH",
        body: JSON.stringify(arg),
      });

      return await response.json();
    },
    {
      onSuccess: () => {
        toast.success(t("success.rename.title"), {
          description: t("success.rename.description"),
        });
        mutate("/api/projects");
      },
      onError: () =>
        toast.error(t("error.rename.title"), {
          description: t("error.rename.description"),
        }),
    },
  );

  const onSubmit = async (data: FormData) => {
    await updateProject({ name: data.name });
    props.onOpenChange?.(false);
  };

  return (
    <Dialog {...props}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <DialogHeader>
            <DialogTitle>{t("dialog.rename.title")}</DialogTitle>
            <DialogDescription>
              {t("dialog.rename.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="title">{t("name.title")}</Label>
            <Input {...register("name")} disabled={isSubmitting} />
            {errors.name && (
              <span className="px-1 text-destructive text-xs">
                {/* @ts-expect-error */}
                {t(`name.${errors.name.message}`)}
              </span>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("cancel")}</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Icons.spinner className="size-4 animate-spin" />
              ) : (
                t("save")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectRenameDialog;
