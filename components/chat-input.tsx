"use client";

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
import { useAttachmentStore } from "@/store/attachment";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { createId } from "@paralleldrive/cuid2";
import type { Message } from "@prisma/client";
import { Role } from "@prisma/client";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";
import type { z } from "zod/v4";

type FormData = z.infer<typeof messageSchema>;

interface ChatInputProps {
  roomId: string;
  scrollToBottom: () => void;
}

const ChatInput = ({ roomId, scrollToBottom }: ChatInputProps) => {
  const t = useTranslations("chat");
  const files = useAttachmentStore((state) => state.files);
  const { remove, clear } = useAttachmentStore.getState();

  const isPending = files.some((file) => file.status === "pending");

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
    const message = {
      id: createId(),
      roomId,
      role: Role.user,
      read: true,
      text: data.text,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await trigger(message, {
      optimisticData: (prev) => {
        const messages = (prev ?? []).map(
          (item: Message & { isPending: boolean }) =>
            item.isPending ? { ...item, isPending: false } : item,
        );

        return [...messages, { ...message, isPending: true }];
      },
      revalidate: false,
    });
    scrollToBottom();
    reset();
    clear();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="w-full space-y-2 rounded-3xl border border-input bg-background p-4 shadow-xs">
      {files.length > 0 && (
        <div className="no-scrollbar flex space-x-3 overflow-x-scroll">
          {files.map((file) => (
            <div key={file.id} className="relative">
              {file.type.startsWith("image/") ? (
                <div className="overflow-hidden rounded-lg border bg-black/30">
                  <div className="relative size-20">
                    <Image
                      src={file.url ?? file.preview ?? ""}
                      alt={file.name}
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
                      {file.name}
                    </p>
                    <p className="truncate text-muted-foreground text-xs">
                      {file.name.split(".").pop()?.toUpperCase() || "FILE"}
                    </p>
                  </div>
                </div>
              )}
              {file.status === "pending" && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                  <Icons.spinner className="size-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {file.status === "success" && (
                <Button
                  onClick={() => remove(file.id)}
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
            disabled={!isValid || isPending || isSubmitting}
          >
            <Icons.arrowUp className="size-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
