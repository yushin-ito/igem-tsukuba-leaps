"use client";

import type { FileInfo } from "@/components/chat";
import Icons from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { messageSchema } from "@/schemas/chat";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { createId } from "@paralleldrive/cuid2";
import type { Message } from "@prisma/client";
import { Role } from "@prisma/client";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { type KeyboardEvent, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";
import type { z } from "zod/v4";

interface Preview {
  info: FileInfo;
  url: string;
}

type FormData = z.infer<typeof messageSchema>;

interface ChatInputProps {
  roomId: string;
  files: FileInfo[];
  onSend: () => void;
  onRemove: (id: string) => void;
}

const ChatInput = ({ roomId, files, onSend, onRemove }: ChatInputProps) => {
  const t = useTranslations("chat");

  const isUploading = files.some((file) => file.status === "uploading");

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid, isSubmitting },
  } = useForm<FormData>({
    resolver: standardSchemaResolver(messageSchema),
    mode: "onChange",
  });

  const key = `/api/messages?roomId=${encodeURIComponent(roomId)}`;

  const fetcher = async (url: string, { arg }: { arg: Message }) => {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(arg),
    });
    return await response.json();
  };

  const { trigger } = useSWRMutation(key, fetcher, {
    onError: () =>
      toast.error(t("error.send.title"), {
        description: t("error.send.description"),
      }),
  });

  const onSubmit = async (data: FormData) => {
    const urls = files
      .filter((f) => f.status === "completed")
      .map((f) => `[${f.file.name}](${f.url})`)
      .join("\n");
    const text = [data.text, urls].filter(Boolean).join("\n\n");
    const message = {
      id: createId(),
      roomId,
      role: Role.USER,
      read: true,
      text,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await trigger(message, {
      optimisticData: (prev) => [...(prev ?? []), message],
    });
    reset();
    onSend();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const previews: Preview[] = useMemo(
    () =>
      files.map((info) => ({
        info,
        url: info.url ?? URL.createObjectURL(info.file),
      })),
    [files],
  );

  useEffect(() => {
    return () => {
      for (const item of previews) {
        if (!item.info.url) {
          URL.revokeObjectURL(item.url);
        }
      }
    };
  }, [previews]);

  return (
    <div className="w-full space-y-2 rounded-3xl border border-input bg-background p-4 shadow-xs">
      {previews.length > 0 && (
        <div className="no-scrollbar flex space-x-3 overflow-x-scroll">
          {previews.map((item) => (
            <div key={item.info.id} className="relative">
              {item.info.file.type.startsWith("image/") ? (
                <div className="overflow-hidden rounded-lg border bg-black/30">
                  <div className="relative size-20">
                    <Image
                      src={item.url}
                      alt={item.info.file.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex max-w-72 space-x-3 rounded-lg border bg-background p-2.5">
                  <div className="flex-shrink-0 rounded-md bg-muted p-3">
                    <Icons.fileText className="size-7 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-px">
                    <p className="truncate font-semibold text-sm">
                      {item.info.file.name}
                    </p>
                    <p className="truncate text-muted-foreground text-xs">
                      {item.info.file.name.split(".").pop()?.toUpperCase() ||
                        "FILE"}
                    </p>
                  </div>
                </div>
              )}
              {item.info.status === "uploading" && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                  <Icons.spinner className="size-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {item.info.status === "completed" && (
                <Button
                  onClick={() => onRemove(item.info.id)}
                  size="icon"
                  className="absolute top-1 right-1 size-5 rounded-full"
                >
                  <Icons.x className="size-3.5 " />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <Label className="sr-only">{t("message")}</Label>
        <Textarea
          {...register("text")}
          onKeyDown={onKeyDown}
          placeholder={t("placeholder")}
          className="!bg-transparent max-h-[420px] min-h-0 resize-none border-none px-2 shadow-none focus-visible:ring-0"
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                disabled={isSubmitting}
              >
                <Icons.plus className="size-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44" align="start">
              <DropdownMenuItem className="gap-1.5">
                <Icons.upload className="size-4 text-foreground" />
                {t("upload")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="submit"
            size="icon"
            className="rounded-full"
            disabled={!isValid || isUploading || isSubmitting}
          >
            <Icons.arrowUp className="size-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
