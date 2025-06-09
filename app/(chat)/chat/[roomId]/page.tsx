import { auth } from "@/auth";
import Chat from "@/components/chat";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { unauthorized } from "next/navigation";

interface ChatPageProps {
  params: Promise<{ roomId: string }>;
}

const ChatPage = async ({ params }: ChatPageProps) => {
  const t = await getTranslations("chat");
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
    const message = await db.message.create({
      data: {
        roomId,
        text: `${t.raw("prompt.welcome")}<hr/>${t.raw("prompt.overview")}<hr/>${t.raw("prompt.step1.instruction")}`,
        role: Role.SYSTEM,
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
