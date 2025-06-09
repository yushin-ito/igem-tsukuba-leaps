import { auth } from "@/auth";
import { unauthorized } from "next/navigation";
import { type FileRouter, createUploadthing } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  file: f({
    blob: {
      maxFileSize: "8MB",
      maxFileCount: 8,
    },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user) {
        unauthorized();
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
