import { unauthorized } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

const searchParamsSchema = z.object({
  roomId: z.string(),
});

const bodySchema = z.object({
  text: z.string(),
  role: z.enum([Role.USER, Role.SYSTEM]),
});

export const GET = async (req: NextRequest) => {
  try {
    const session = await auth();

    if (!session?.user) {
      unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const { roomId } = searchParamsSchema.parse(
      Object.fromEntries(searchParams),
    );

    const messages = await db.message.findMany({
      where: {
        roomId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(messages, { status: 200 });
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

    const { searchParams } = new URL(req.url);
    const { roomId } = searchParamsSchema.parse(
      Object.fromEntries(searchParams),
    );

    const json = await req.json();
    const body = bodySchema.parse(json);

    const message = await db.message.create({
      data: {
        roomId,
        text: body.text,
        role: body.role,
      },
      select: { id: true },
    });

    return NextResponse.json(message, { status: 201 });
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
