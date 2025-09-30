import { unauthorized } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

import { auth } from "@/auth";
import { db } from "@/lib/db";

const searchParamsSchema = z.object({
  name: z.string().optional(),
});

const bodySchema = z.object({
  name: z.string(),
});

export const GET = async (req: NextRequest) => {
  try {
    const session = await auth();

    if (!session?.user) {
      unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const { name } = searchParamsSchema.parse(Object.fromEntries(searchParams));

    const projects = await db.project.findMany({
      where: {
        userId: session.user.id,
        name: name
          ? {
              contains: name,
              mode: "insensitive",
            }
          : undefined,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(projects, { status: 200 });
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

    const project = await db.project.create({
      data: {
        name: body.name,
        userId: session.user.id,
      },
      select: { id: true },
    });

    return NextResponse.json(project, { status: 201 });
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
