import CodeBlock from "@/components/code-block";
import Typewriter from "@/components/typewriter";
import { siteConfig } from "@/config/site";
import { rich } from "@/lib/utils";
import { type Message, Role } from "@prisma/client";
import useSWRMutation from "swr/mutation";

interface ChatItemProps {
  message: Message;
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

  if (message.role === Role.USER) {
    return (
      <div key={message.id} className="flex justify-end">
        <div className="max-w-lg whitespace-pre-wrap break-words rounded-3xl bg-accent px-5 py-2.5 text-accent-foreground shadow-xs">
          {message.text}
        </div>
      </div>
    );
  }

  if (message.role === Role.SYSTEM) {
    return (
      <div key={message.id}>
        <div className="whitespace-pre-line leading-relaxed">
          {message.read ? (
            <>
              {rich(message.text, {
                components: {
                  code: (chunks) => <CodeBlock>{chunks}</CodeBlock>,
                  strong: (chunks) => <strong>{chunks}</strong>,
                  br: () => <br />,
                  hr: () => <hr className="my-4" />,
                },
                values: {
                  name: siteConfig.name,
                },
              })}
            </>
          ) : (
            <Typewriter speed={10} onDone={() => trigger({ read: true })}>
              {rich(message.text, {
                components: {
                  code: (chunks) => <CodeBlock>{chunks}</CodeBlock>,
                  strong: (chunks) => <strong>{chunks}</strong>,
                  br: () => <br />,
                  hr: () => <hr className="my-4" />,
                },
                values: {
                  name: siteConfig.name,
                },
              })}
            </Typewriter>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default ChatItem;
