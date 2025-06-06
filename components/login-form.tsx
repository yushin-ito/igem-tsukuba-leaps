"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { signInWithEmail, signInWithProvider } from "@/actions/auth";
import Icons from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/schemas/auth";

type FormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const t = useTranslations("auth");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  });
  const [isPendingSignInWithEmail, startTransitionSignInWithEmail] =
    useTransition();
  const [isPendingSignInWithGoogle, startTransitionSignInWithGoogle] =
    useTransition();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("from") || "/";

  const onSubmit = (data: FormData) => {
    startTransitionSignInWithEmail(async () => {
      await signInWithEmail(data.email, redirectUrl);

      toast.success(t("login.success.title"), {
        description: t("login.success.description"),
      });
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
            <div className="space-y-2">
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isPendingSignInWithEmail}
                {...register("email")}
              />
              {errors.email && (
                <span className="px-1 text-destructive text-xs">
                  {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/* @ts-expect-error */}
                  {t(errors.email.message)}
                </span>
              )}
            </div>
          </div>
          <Button className="w-full" disabled={isPendingSignInWithEmail}>
            {isPendingSignInWithEmail ? (
              <Icons.spinner className="size-4 animate-spin" />
            ) : (
              t("login.submit")
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
          startTransitionSignInWithGoogle(async () => {
            await signInWithProvider("google", redirectUrl);
          });
        }}
        disabled={isPendingSignInWithGoogle}
      >
        {isPendingSignInWithGoogle ? (
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
            {t.rich("login.login_with_provider", {
              provider: "Google",
            })}
          </>
        )}
      </Button>
    </div>
  );
};

export default LoginForm;
