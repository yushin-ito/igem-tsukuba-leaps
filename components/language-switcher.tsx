"use client";

import Icons from "@/components/icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

const LanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();

  const onTranslate = useCallback(() => {
    document.cookie = [
      `locale=${locale === "en" ? "ja" : "en"}`,
      "path=/",
      "max-age=31536000",
    ].join("; ");

    router.refresh();
  }, [locale, router]);

  return (
    <Button
      variant="ghost"
      className={cn(buttonVariants({ variant: "ghost" }), "size-8")}
      onClick={onTranslate}
    >
      <Icons.languages />
    </Button>
  );
};

export default LanguageSwitcher;
