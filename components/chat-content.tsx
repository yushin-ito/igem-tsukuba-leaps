"use client";

import ChatItem from "@/components/chat-item";
import { cn } from "@/lib/utils";
import type { Message } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";

interface ChatContentProps {
  anchor: React.RefObject<HTMLDivElement | null>;
  roomId: string;
  messages: Message[];
}

const ChatContent = ({ anchor, roomId, messages }: ChatContentProps) => {
  const isMounted = useRef(false);
  const [isReady, setIsReady] = useState(false);

  const key = `/api/messages?roomId=${roomId}`;

  const fetcher = async (url: string) => {
    const response = await fetch(url);
    return await response.json();
  };

  const { data } = useSWR<Message[]>(key, fetcher, {
    fallbackData: messages,
    revalidateOnFocus: false,
    onSuccess: () => {
      requestAnimationFrame(() => {
        anchor.current?.scrollIntoView({
          behavior: isMounted.current ? "auto" : "smooth",
        });
      });

      isMounted.current = true;
    },
  });

  useEffect(() => {
    if (!anchor.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsReady(true);
        }
      },
      {
        root: null,
        threshold: 1.0,
      },
    );

    observer.observe(anchor.current);

    return () => {
      observer.disconnect();
    };
  }, [anchor]);

  if (!data) {
    return null;
  }

  return (
    <div
      className={cn(
        "space-y-16 py-16 transition-opacity duration-100",
        isReady ? "opacity-100" : "opacity-0",
      )}
    >
      {data.map((message) => (
        <ChatItem key={message.id} message={message} />
      ))}
      <div ref={anchor} />
    </div>
  );
};

export default ChatContent;
