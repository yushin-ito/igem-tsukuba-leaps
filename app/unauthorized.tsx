import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const UnauthorizedPage = async () => {
  const t = await getTranslations("unauthorized");

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
      <Link
        href="/login"
        className={cn(buttonVariants(), "rounded-full px-8 py-6")}
      >
        {t("back_to_login")}
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
