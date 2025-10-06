import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Suspense } from "react";

import Icons from "@/components/icons";
import LoginForm from "@/components/login-form";

export const generateMetadata = async () => {
  const t = await getTranslations("auth.login.metadata");

  return {
    title: t("title"),
    description: t("description"),
  };
};

const LoginPage = async () => {
  const t = await getTranslations("auth");

  return (
    <div className="container flex h-full flex-col items-center justify-center">
      <Suspense
        fallback={
          <Icons.spinner className="size-5 animate-spin text-muted-foreground" />
        }
      >
        <div className="space-y-6 sm:w-[320px]">
          <div className="space-y-2 text-center">
            <h1 className="font-bold text-2xl">{t("login.metadata.title")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("login.metadata.description")}
            </p>
          </div>
          <LoginForm />
          <p className="text-center text-muted-foreground text-sm">
            {t("login.do_not_have_an_account")}{" "}
            <Link href="/signup" className="underline underline-offset-2">
              {t("signup.metadata.title")}
            </Link>
          </p>
          <p className="whitespace-pre-line text-center text-muted-foreground text-sm">
            {t.rich("notice", {
              link: (children) => (
                <Link
                  href={`/${children?.toString()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {
                    // @ts-expect-error
                    t(children?.toString())
                  }
                </Link>
              ),
            })}
          </p>
        </div>
      </Suspense>
    </div>
  );
};

export default LoginPage;
