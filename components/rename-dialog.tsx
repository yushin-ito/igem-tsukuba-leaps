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
import { renameSchema } from "@/schemas/chat";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Room } from "@prisma/client";
import type { DialogProps } from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
import type { z } from "zod/v4";

type FormData = z.infer<typeof renameSchema>;

interface RenameDialogProps extends DialogProps {
  name: string;
  roomId: string;
}

const RenameDialog = ({ name, roomId, ...props }: RenameDialogProps) => {
  const t = useTranslations("chat");
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

  const key = `/api/rooms/${encodeURIComponent(roomId)}`;

  const fetcher = async (url: string, { arg }: { arg: Partial<Room> }) => {
    const response = await fetch(url, {
      method: "PATCH",
      body: JSON.stringify(arg),
    });
    return await response.json();
  };

  const { trigger } = useSWRMutation(key, fetcher, {
    onSuccess: () => {
      toast.success(t("success.rename.title"), {
        description: t("success.rename.description"),
      });
      mutate("/api/rooms");
    },
    onError: () =>
      toast.error(t("error.rename.title"), {
        description: t("error.rename.description"),
      }),
  });

  const onSubmit = async (data: FormData) => {
    await trigger({ name: data.name });
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
            <Label htmlFor="title">{t("name")}</Label>
            <Input {...register("name")} disabled={isSubmitting} />
            {errors.name && (
              <span className="px-1 text-destructive text-xs">
                {/* @ts-expect-error */}
                {t(errors.title.message)}
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

export default RenameDialog;
