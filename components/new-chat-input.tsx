"use client";

import Icons from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Room } from "@prisma/client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";

const NewChatInput = () => {
  const t = useTranslations("chat");
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const key = "/api/rooms";

  const fetcher = async (
    url: string,
    { arg }: { arg: Pick<Room, "title"> },
  ) => {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(arg),
    });

    return await response.json();
  };

  const { trigger } = useSWRMutation(key, fetcher, {
    onSuccess: (data) => {
      router.push(`/chat/${data.id}`);
    },
    onError: () =>
      toast.error(t("error.create.title"), {
        description: t("error.create.description"),
      }),
  });

  const onSubmit = () => {
    const message = {
      title: t("untitled_chat"),
    };

    trigger(message);
    mutate("/api/rooms");
  };

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-input p-4 shadow-xs">
      <Label className="sr-only">{t("message")}</Label>
      <Textarea
        className="!bg-transparent min-h-0 resize-none border-none px-2 shadow-none focus-visible:ring-0"
        value={t("start")}
        readOnly
      />
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="size-8 rounded-full">
          <Icons.plus className="size-5 text-muted-foreground" />
        </Button>
        <Button size="icon" className="rounded-full" onClick={onSubmit}>
          <Icons.arrowUp className="size-5" />
        </Button>
      </div>
    </div>
  );
};

export default NewChatInput;
