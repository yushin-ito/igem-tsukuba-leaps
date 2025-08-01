import { auth } from "@/auth";
import { unauthorized } from "next/navigation";
import { type FileRouter, createUploadthing } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  file: f({
    "text/csv": {
      maxFileCount: 1,
      maxFileSize: "1GB",
    },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user) {
        unauthorized();
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata }) => {
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
