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
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    const blob = await put(file.name, file, {
      access: "public",
      allowOverwrite: true,
    });

    return NextResponse.json(blob, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
