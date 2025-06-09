import { unauthorized } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";

const contextSchema = z.object({
  params: z
    .object({
      messageId: z.string(),
    })
    .promise(),
});

const bodySchema = z.object({
  text: z.string().min(1).max(1024).optional(),
  read: z.boolean().optional(),
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
    const { messageId } = await params;

    const message = await db.message.delete({
      where: {
        id: messageId,
      },
    });

    return NextResponse.json(message, { status: 200 });
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
    const { messageId } = await params;

    const json = await req.json();
    const body = bodySchema.parse(json);

    const message = await db.message.update({
      where: {
        id: messageId,
      },
      data: {
        text: body.text,
        read: body.read,
      },
    });

    return NextResponse.json(message, { status: 200 });
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
