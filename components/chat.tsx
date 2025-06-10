"use client";

import ChatItem from "@/components/chat-item";
import { cn } from "@/lib/utils";
import type { Message } from "@prisma/client";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import ChatInput from "./chat-input";
import Dropzone from "./dropzone";
import ScrollToBottomButton from "./scroll-to-bottom-button";

interface ChatProps {
  roomId: string;
  messages: Message[];
}

const Chat = ({ roomId, messages }: ChatProps) => {
  const isMounted = useRef(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);
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
        anchorRef.current?.scrollIntoView({
          behavior: isMounted.current ? "auto" : "smooth",
        });
      });

      isMounted.current = true;
    },
  });

  useEffect(() => {
    if (!anchorRef.current) {
      return;
    }

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

    observer.observe(anchorRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    if (!anchorRef.current) {
      return;
    }

    anchorRef.current.scrollIntoView({
      behavior: "smooth",
    });
  }, []);

  if (!data) {
    return null;
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-3xl px-12">
          <div
            className={cn(
              "space-y-12 py-12 transition-opacity duration-100",
              isReady ? "opacity-100" : "opacity-0",
            )}
          >
            {data.map((message) => (
              <ChatItem key={message.id} message={message} />
            ))}
            <div ref={anchorRef} />
          </div>
        </div>
      </div>
      <div className="-mt-6 container relative max-w-3xl flex-shrink-0 px-12 pb-6">
        <div className="-top-6 pointer-events-none absolute inset-x-12 h-12 bg-gradient-to-t from-background to-transparent" />
        <ScrollToBottomButton
          anchorRef={anchorRef}
          className="-translate-x-1/2 fade-in fade-out -top-10 absolute left-1/2 animate-in"
        />
        <div className="relative">
          <ChatInput roomId={roomId} scrollToBottom={scrollToBottom} />
        </div>
      </div>
      <Dropzone />
    </>
  );
};

export default Chat;
