import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

import Icons from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export const generateMetadata = async () => {
  const t = await getTranslations("top");

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
  };
};

const TopPage = async () => {
  const t = await getTranslations("top");

  return (
    <section className="container max-w-7xl py-12">
      <div className="grid w-full items-center gap-10 text-center md:grid-cols-[1fr_840px] md:text-left">
        <div className="space-y-10 md:min-w-[380px]">
          <div className="space-y-2 md:space-y-4">
            <h1 className="font-bold text-3xl tracking-tight md:text-4xl">
              {siteConfig.name}
            </h1>
            <p className="text-base text-muted-foreground">
              {t("metadata.description")}
            </p>
          </div>
          <div className="hidden w-full items-center justify-end space-x-2 px-4 md:flex">
            <Link
              href={siteConfig.links.organization}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline" })}
            >
              {t("about_us")}
            </Link>
            <Link
              href="/login"
              className={buttonVariants({ variant: "default" })}
            >
              {t("get_started")}
              <Icons.arrowRight />
            </Link>
          </div>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl border shadow">
          <Image
            src="/images/main-visual-light.png"
            alt="Main Visual"
            fill
            priority
            sizes="(min-width: 640px) 640px, 100vw"
            className="transition-colors dark:hidden"
          />
          <Image
            src="/images/main-visual-dark.png"
            alt="Main Visual"
            fill
            sizes="(min-width: 640px) 640px, 100vw"
            className="hidden transition-colors dark:block"
          />
        </div>
        <div className="flex flex-col items-center space-y-4 md:hidden">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full max-w-64",
            )}
          >
            {t("get_started")}
          </Link>
          <Link
            href={siteConfig.links.organization}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full max-w-64",
            )}
          >
            {t("about_us")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopPage;
