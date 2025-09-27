import { put } from "@vercel/blob";
import { unauthorized } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

export const POST = async (req: NextRequest) => {
  try {
    const session = await auth();

    if (!session?.user) {
      unauthorized();
    }

    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    const blobs = await Promise.all(
      files.map((file) =>
        put(file.name, file, {
          access: "public",
        }),
      ),
    );

    return NextResponse.json(blobs, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
