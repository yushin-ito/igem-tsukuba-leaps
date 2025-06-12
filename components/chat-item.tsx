"use client";

import Markdown from "@/components/markdown";
import { useTypewriter } from "@/hooks/use-typewriter";
import { cn, parseMarkdownToBlocks } from "@/lib/utils";
import { type Message, Role } from "@prisma/client";
import { useMemo } from "react";
import useSWRMutation from "swr/mutation";

interface ChatItemProps {
  message: Message & { isPending?: boolean };
}

const UserChatItem = ({ message }: ChatItemProps) => {
  return (
    <div
      className={cn("flex items-start justify-end", {
        "min-h-[calc(100dvh-286px)]": message.isPending,
      })}
    >
      <div className="max-w-lg whitespace-pre-wrap break-words rounded-3xl bg-accent px-5 py-2.5 text-accent-foreground shadow-xs">
        {message.text}
      </div>
    </div>
  );
};

const SystemChatItem = ({ message }: ChatItemProps) => {
  const key = `/api/messages/${encodeURIComponent(message.id)}`;

  const fetcher = async (url: string, { arg }: { arg: Partial<Message> }) => {
    const response = await fetch(url, {
      method: "PATCH",
      body: JSON.stringify(arg),
    });
    return await response.json();
  };

  const { trigger } = useSWRMutation(key, fetcher);

  const blocks = useMemo(
    () => parseMarkdownToBlocks(message.text),
    [message.text],
  );

  const { text } = useTypewriter(blocks, {
    onDone: () => {
      trigger({ read: true });
    },
  });

  return (
    <div>
      {message.read ? (
        <Markdown>{message.text}</Markdown>
      ) : (
        <Markdown>{text}</Markdown>
      )}
    </div>
  );
};

const ChatItem = ({ message }: ChatItemProps) => {
  if (message.role === Role.USER) {
    return <UserChatItem message={message} />;
  }

  if (message.role === Role.SYSTEM) {
    return <SystemChatItem message={message} />;
  }

  return null;
};

export default ChatItem;
