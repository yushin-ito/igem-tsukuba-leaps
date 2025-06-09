"use client";

import AnchorButton from "@/components/anchor-button";
import ChatContent from "@/components/chat-content";
import ChatInput from "@/components/chat-input";
import Dropzone from "@/components/dropzone";
import { useUploadThing } from "@/lib/uploadthing";
import { createId } from "@paralleldrive/cuid2";
import type { Message } from "@prisma/client";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export interface FileInfo {
  id: string;
  file: File;
  status: "pending" | "uploading" | "completed" | "error";
  url?: string;
  key?: string;
}

interface ChatProps {
  roomId: string;
  messages: Message[];
}

const Chat = ({ roomId, messages }: ChatProps) => {
  const t = useTranslations("chat");
  const anchor = useRef<HTMLDivElement | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);

  const { startUpload } = useUploadThing("file", {
    onUploadError: (error) => {
      setFiles((prev) => prev.filter((f) => f.status !== "uploading"));

      if (error.code === "TOO_SMALL") {
        toast.error(t("error.too_small.title"), {
          description: t("error.too_small.description", { size: "" }),
        });

        return;
      }

      if (error.code === "TOO_LARGE") {
        toast.error(t("error.too_large.title"), {
          description: t("error.too_large.description", { size: "" }),
        });

        return;
      }

      toast.error(t("error.upload.title"), {
        description: t("error.upload.description"),
      });
    },
    onUploadBegin: (fileName) => {
      setFiles((prev) => {
        const files = [...prev];
        const index = files.findIndex(
          (info) => info.file.name === fileName && info.status === "pending",
        );
        if (index > -1) {
          files[index] = { ...files[index], status: "uploading" };
        }
        return files;
      });
    },
    onClientUploadComplete: (res) => {
      setFiles((prev) =>
        prev.map((info) => {
          const uploadedFile = res.find((r) => r.name === info.file.name);
          if (uploadedFile && info.status === "uploading") {
            return {
              ...info,
              status: "completed",
              url: uploadedFile.ufsUrl,
              key: uploadedFile.key,
            };
          }
          return info;
        }),
      );
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const files = acceptedFiles.map(
        (file): FileInfo => ({
          id: createId(),
          file,
          status: "pending",
        }),
      );
      setFiles((prev) => [...prev, ...files]);
      startUpload(acceptedFiles);
    },
    [startUpload],
  );

  const onRemove = (id: string) => {
    setFiles((prev) => prev.filter((info) => info.id !== id));
  };

  const onSend = () => {
    setFiles([]);
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl px-12">
          <ChatContent anchor={anchor} roomId={roomId} messages={messages} />
        </div>
      </div>
      <div className="-mt-6 container relative max-w-4xl flex-shrink-0 px-12 pb-6">
        <div className="-top-6 pointer-events-none absolute inset-x-12 h-12 bg-gradient-to-t from-background to-transparent" />
        <AnchorButton
          target={anchor}
          className="-translate-x-1/2 fade-in fade-out -top-10 absolute left-1/2 animate-in"
        />
        <div className="relative">
          <ChatInput
            roomId={roomId}
            files={files}
            onSend={onSend}
            onRemove={onRemove}
          />
        </div>
      </div>
      <Dropzone onDrop={onDrop} />
    </>
  );
};

export default Chat;
