"use server";

import * as auth from "@/auth";

export const signInWithEmail = async (email: string, callbackUrl: string) => {
  await auth.signIn("resend", {
    email: email.toLowerCase(),
    redirect: false,
    callbackUrl,
    options: {},
  });
};

export const signInWithProvider = async (
  provider: string,
  callbackUrl: string,
) => {
  await auth.signIn(provider, { callbackUrl });
};

export const signOut = async () => {
  await auth.signOut();
};
