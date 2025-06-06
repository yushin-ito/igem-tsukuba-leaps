import { getTranslations } from "next-intl/server";
import Link from "next/link";
import React, { Suspense } from "react";

import Icons from "@/components/icons";
import SignupForm from "@/components/signup-form";

export const generateMetadata = async () => {
  const t = await getTranslations("auth.signup.metadata");

  return {
    title: t("title"),
    description: t("description"),
  };
};

const SignupPage = async () => {
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
            <h1 className="font-bold text-2xl">{t("signup.metadata.title")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("signup.metadata.description")}
            </p>
          </div>
          <SignupForm />
          <p className="text-center text-muted-foreground text-sm">
            {t("signup.already_have_an_account")}{" "}
            <Link href="/login" className="underline underline-offset-4">
              {t("login.metadata.title")}
            </Link>
          </p>
        </div>
      </Suspense>
    </div>
  );
};

export default SignupPage;
