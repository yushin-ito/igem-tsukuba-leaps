import { auth } from "@/auth";
import AppSidebar from "@/components/app-sidebar";
import ChatHeader from "@/components/chat-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { db } from "@/lib/db";
import { unauthorized } from "next/navigation";
import type { ReactNode } from "react";

interface ChatLayoutProps {
  children: ReactNode;
}

const ChatLayout = async ({ children }: ChatLayoutProps) => {
  const session = await auth();

  if (!session?.user) {
    unauthorized();
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      image: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    unauthorized();
  }

  const rooms = await db.room.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <SidebarProvider>
      <AppSidebar user={user} rooms={rooms} />
      <main className="relative flex-1 overflow-hidden">
        <ChatHeader />
        {children}
      </main>
    </SidebarProvider>
  );
};

export default ChatLayout;
