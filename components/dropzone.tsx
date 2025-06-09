"use client";

import Icons from "@/components/icons";
import { useDropzone } from "@uploadthing/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

interface DropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
}

const Dropzone = ({ onDrop }: DropzoneProps) => {
  const t = useTranslations("chat");
  const [isShown, setIsShown] = useState(false);
  const counter = useRef(0);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
      setIsShown(false);
      counter.current = 0;
    },
  });

  useEffect(() => {
    const onDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      counter.current++;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsShown(true);
      }
    };

    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      counter.current--;
      if (counter.current === 0) {
        setIsShown(false);
      }
    };

    const onDropEvent = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsShown(false);
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

  if (!isShown) {
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
