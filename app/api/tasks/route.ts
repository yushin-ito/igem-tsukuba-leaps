import { unauthorized } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

import { auth } from "@/auth";
import { db } from "@/lib/db";

const bodySchema = z.object({
  projectId: z.string(),
});

export const GET = async (req: NextRequest) => {
  try {
    const session = await auth();

    if (!session?.user) {
      unauthorized();
    }

    const json = await req.json();
    const body = bodySchema.parse(json);

    const tasks = await db.task.findMany({
      where: {
        projectId: body.projectId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.issues }, { status: 422 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const session = await auth();

    if (!session?.user) {
      unauthorized();
    }

    const json = await req.json();
    const body = bodySchema.parse(json);

    const task = await db.task.create({
      data: {
        projectId: body.projectId,
        status: "pending",
      },
      select: { id: true },
    });

    return NextResponse.json(task, { status: 201 });
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
