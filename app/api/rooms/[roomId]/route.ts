import { unauthorized } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";

const contextSchema = z.object({
  params: z
    .object({
      roomId: z.string(),
    })
    .promise(),
});

const bodySchema = z.object({
  name: z.string().min(3).max(128).optional(),
  fileKey: z.string().optional(),
});

export const DELETE = async (
  _req: NextRequest,
  context: z.infer<typeof contextSchema>,
) => {
  try {
    const session = await auth();

    if (!session?.user) {
      unauthorized();
    }

    const { params } = contextSchema.parse(context);
    const { roomId } = await params;

    const room = await db.room.delete({
      where: {
        id: roomId,
      },
    });

    return NextResponse.json(room, { status: 200 });
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
  context: z.infer<typeof contextSchema>,
) => {
  try {
    const session = await auth();

    if (!session?.user) {
      unauthorized();
    }

    const { params } = contextSchema.parse(context);
    const { roomId } = await params;

    const json = await req.json();
    const body = bodySchema.parse(json);

    const room = await db.room.update({
      where: {
        id: roomId,
      },
      data: {
        name: body.name,
        fileKey: body.fileKey,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(room, { status: 200 });
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
