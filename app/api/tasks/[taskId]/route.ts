import { unauthorized } from "next/navigation";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Status } from "@prisma/client";

const bodySchema = z.object({
  status: z.nativeEnum(Status),
});

export const PATCH = async (
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) => {
  try {
    const session = await auth();

    if (!session?.user) {
      unauthorized();
    }

    const { taskId } = await params;

    const json = await req.json();
    const body = bodySchema.parse(json);

    const task = await db.task.update({
      where: {
        id: taskId,
      },
      data: {
        status: body.status,
      },
    });

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.issues }, { status: 422 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
