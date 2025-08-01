"use client";

import Icons from "@/components/icons";
import { useUploadThing } from "@/lib/uploadthing";
import { useAttachmentStore } from "@/store/attachment";
import type { FileInfo } from "@/types";
import { createId } from "@paralleldrive/cuid2";
import type { Room } from "@prisma/client";
import { useDropzone } from "@uploadthing/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";

interface DropzoneProps {
  roomId: string;
}

const Dropzone = ({ roomId }: DropzoneProps) => {
  const t = useTranslations("chat");
  const counter = useRef(0);
  const [isVisible, setIsVisible] = useState(false);
  const { add, update } = useAttachmentStore.getState();

  const key = `/api/rooms/${encodeURIComponent(roomId)}`;

  const fetcher = async (url: string, { arg }: { arg: Partial<Room> }) => {
    const response = await fetch(url, {
      method: "PATCH",
      body: JSON.stringify(arg),
    });
    return await response.json();
  };

  const { trigger } = useSWRMutation(key, fetcher, {
    onError: () =>
      toast.error(t("error.upload.title"), {
        description: t("error.upload.description"),
      }),
  });

  const { startUpload } = useUploadThing("file", {
    onUploadError: (error) => {
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
    onClientUploadComplete: (res) => {
      for (const data of res) {
        trigger({ fileKey: data.key });

        const file = useAttachmentStore
          .getState()
          .files.find((f) => f.name === data.name);

        if (file) {
          update(file.id, {
            ...file,
            status: "success",
            url: data.ufsUrl,
            key: data.key,
          });
        }
      }
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      const files = acceptedFiles.map(
        (file): FileInfo => ({
          id: createId(),
          status: "pending",
          name: file.name,
          type: file.type,
          size: file.size,
          preview: URL.createObjectURL(file),
        }),
      );

      for (const file of files) {
        add(file);
      }

      startUpload(acceptedFiles);
      setIsVisible(false);
      counter.current = 0;
    },
  });

  useEffect(() => {
    const onDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      counter.current++;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsVisible(true);
      }
    };

    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      counter.current--;
      if (counter.current === 0) {
        setIsVisible(false);
      }
    };

    const onDropEvent = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsVisible(false);
      counter.current = 0;
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDropEvent);

    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDropEvent);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      {...getRootProps()}
      className="absolute inset-0 z-50 flex cursor-pointer items-center justify-center bg-background/90 px-4"
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center space-y-5">
        <div className="flex size-20 items-center justify-center rounded-full bg-muted">
          <Icons.cloudUpload className="size-10 text-muted-foreground" />
        </div>
        <div className="space-y-2 text-center">
          <h2 className="font-semibold text-xl">{t("dropzone.title")}</h2>
          <p className="text-center text-muted-foreground text-sm">
            {t("dropzone.description")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dropzone;
