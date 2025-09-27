import { unauthorized } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";

const bodySchema = z.object({
  name: z.string().min(3).max(128).optional(),
});

export const DELETE = async (
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) => {
  try {
    const session = await auth();

    if (!session?.user) {
      unauthorized();
    }

    const { projectId } = await params;

    const project = await db.project.delete({
      where: {
        id: projectId,
      },
    });

    return NextResponse.json(project, { status: 200 });
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

export const PATCH = async (
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) => {
  try {
    const session = await auth();

    if (!session?.user) {
      unauthorized();
    }

    const { projectId } = await params;

    const json = await req.json();
    const body = bodySchema.parse(json);

    const project = await db.project.update({
      where: {
        id: projectId,
      },
      data: {
        name: body.name,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(project, { status: 200 });
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
