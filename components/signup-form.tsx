"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod/v4";

import { signInWithEmail, signInWithProvider } from "@/actions/auth";
import Icons from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupSchema } from "@/schemas/auth";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

type FormData = z.infer<typeof signupSchema>;

const SignupForm = () => {
  const t = useTranslations("auth");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: standardSchemaResolver(signupSchema),
  });
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("from") || "/";

  const onSubmit = async (data: FormData) => {
    await signInWithEmail(data.email, redirectUrl);

    toast.success(t("signup.success.title"), {
      description: t("signup.success.description"),
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <div className="space-y-1">
            <Label className="sr-only" htmlFor="email">
              {t("email")}
            </Label>
            <div className="spacd-y-2">
              <Input
                {...register("email")}
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isSubmitting}
              />
              {errors.email && (
                <span className="px-1 text-destructive text-xs">
                  {/* @ts-expect-error */}
                  {t(errors.email.message)}
                </span>
              )}
            </div>
          </div>
          <Button className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <Icons.spinner className="size-4 animate-spin" />
            ) : (
              t("signup.submit")
            )}
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t("or")}
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        className="relative w-full"
        onClick={() => {
          startTransition(async () => {
            await signInWithProvider("google", redirectUrl);
          });
        }}
        disabled={isPending}
      >
        {isPending ? (
          <Icons.spinner className="size-4 animate-spin" />
        ) : (
          <>
            <Image
              src="/images/google.png"
              alt="Google"
              width={16}
              height={16}
              className="mr-0.5"
            />
            {t("signup.signup_with_provider", { provider: "Google" })}
          </>
        )}
      </Button>
    </div>
  );
};

export default SignupForm;
