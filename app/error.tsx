"use client";

import { useTranslations } from "next-intl";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ErrorPage = ({ reset }: { reset: () => void }) => {
  const t = useTranslations("error");

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center space-y-16">
      <div className="space-y-4 text-center">
        <h1 className="font-bold text-[min(5vw,36px)]">
          {t("metadata.title")}
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          {t("metadata.description")}
        </p>
      </div>
      <Button
        onClick={() => reset()}
        className={cn(buttonVariants(), "rounded-full px-8 py-6")}
      >
        {t("reload")}
      </Button>
    </div>
  );
};

export default ErrorPage;
