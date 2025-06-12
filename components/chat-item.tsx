"use client";
import Markdown from "@/components/markdown";
import { useTypewriter } from "@/hooks/use-typewriter";
import { cn, parseMarkdownToBlocks } from "@/lib/utils";
import { type Message, Role } from "@prisma/client";
import { useEffect, useMemo } from "react";
import useSWRMutation from "swr/mutation";

interface ChatItemProps {
  message: Message & { isPending?: boolean };
}

const ChatItem = ({ message }: ChatItemProps) => {
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

  const { text, isDone } = useTypewriter(blocks);

  useEffect(() => {
    if (isDone) {
      trigger({ read: true });
    }
  }, [isDone, trigger]);

  if (message.role === Role.USER) {
    return (
      <div
        id={message.id}
        key={message.id}
        className={cn("flex items-start justify-end", {
          "min-h-[calc(100dvh-286px)]": message.isPending,
        })}
      >
        <div className="max-w-lg whitespace-pre-wrap break-words rounded-3xl bg-accent px-5 py-2.5 text-accent-foreground shadow-xs">
          {message.text}
        </div>
      </div>
    );
  }

  if (message.role === Role.SYSTEM) {
    return (
      <div key={message.id}>
        {message.read ? (
          <Markdown>{message.text}</Markdown>
        ) : (
          <Markdown>{text}</Markdown>
        )}
      </div>
    );
  }

  return null;
};

export default ChatItem;
