import fs from "node:fs";
import path from "node:path";
import { auth } from "@/auth";
import Chat from "@/components/chat";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { getLocale } from "next-intl/server";
import { unauthorized } from "next/navigation";

interface ChatPageProps {
  params: Promise<{ roomId: string }>;
}

const ChatPage = async ({ params }: ChatPageProps) => {
  const locale = await getLocale();
  const session = await auth();
  const { roomId } = await params;

  if (!session?.user) {
    unauthorized();
  }

  let messages = [];

  messages = await db.message.findMany({
    where: {
      roomId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (messages.length === 0) {
    const text = fs.readFileSync(
      path.join(process.cwd(), "content", "welcome", `${locale}.md`),
      "utf-8",
    );

    const message = await db.message.create({
      data: {
        roomId,
        text,
        role: Role.system,
      },
    });

    messages = [message];
  }

  return (
    <section className="flex h-screen flex-col">
      <Chat roomId={roomId} messages={messages} />
    </section>
  );
};

export default ChatPage;
