"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AlertDialogProps } from "@radix-ui/react-alert-dialog";
import { useTranslations } from "next-intl";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";

interface DeleteDialogProps extends AlertDialogProps {
  projectId: string;
}

const DeleteDialog = ({ projectId, ...props }: DeleteDialogProps) => {
  const t = useTranslations("project");
  const router = useRouter();
  const segment = useSelectedLayoutSegment();
  const { mutate } = useSWRConfig();

  const { trigger: deleteProject } = useSWRMutation(
    `/api/projects/${encodeURIComponent(projectId)}`,
    async (url: string) => {
      const response = await fetch(url, {
        method: "DELETE",
      });
      return await response.json();
    },
    {
      onSuccess: () => {
        mutate("/api/projects");

        props.onOpenChange?.(false);

        toast.success(t("success.delete.title"), {
          description: t("success.delete.description"),
        });
      },
      onError: () =>
        toast.error(t("error.delete.title"), {
          description: t("error.delete.description"),
        }),
    },
  );

  const onDelete = () => {
    if (segment === projectId) {
      router.push("/project");
    }

    deleteProject();
  };

  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("dialog.delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("dialog.delete.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>
            {t("continue")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDialog;
