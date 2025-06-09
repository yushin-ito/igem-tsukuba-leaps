import { unauthorized } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

import { auth } from "@/auth";
import { db } from "@/lib/db";

const searchParamsSchema = z.object({
  query: z.string().optional(),
});

const bodySchema = z.object({
  title: z.string(),
});

export const GET = async (req: NextRequest) => {
  try {
    const session = await auth();

    if (!session?.user) {
      unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const { query } = searchParamsSchema.parse(
      Object.fromEntries(searchParams),
    );

    const rooms = await db.room.findMany({
      where: {
        userId: session.user.id,
        title: query
          ? {
              contains: query,
              mode: "insensitive",
            }
          : undefined,
      },
      orderBy: {
        updatedAt: "asc",
      },
    });

    return NextResponse.json(rooms, { status: 200 });
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

    const room = await db.room.create({
      data: {
        title: body.title,
        userId: session.user.id,
      },
      select: { id: true },
    });

    return NextResponse.json(room, { status: 201 });
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
