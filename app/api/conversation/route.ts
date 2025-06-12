import { unauthorized } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Role, Step } from "@prisma/client";

const searchParamsSchema = z.object({
  step: z.nativeEnum(Step).optional(),
});

const bodySchema = z.object({
  roomId: z.string(),
  text: z.string(),
  role: z.enum([Role.user, Role.system]),
});

export const POST = async (req: NextRequest) => {
  try {
    const session = await auth();

    if (!session?.user) {
      unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const { step } = searchParamsSchema.parse(Object.fromEntries(searchParams));

    const json = await req.json();
    const body = bodySchema.parse(json);

    const message = await db.message.create({
      data: {
        roomId: body.roomId,
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
