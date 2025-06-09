import NewChatInput from "@/components/new-chat-input";
import { siteConfig } from "@/config/site";
import { getTranslations } from "next-intl/server";

const ChatPage = async () => {
  const t = await getTranslations("chat");

  return (
    <section className="flex min-h-screen flex-col items-center justify-center space-y-12 px-12">
      <h1 className="font-semibold text-3xl">
        {t("welcome", { name: siteConfig.name })}
      </h1>
      <div className="container max-w-3xl px-12">
        <NewChatInput />
      </div>
    </section>
  );
};

export default ChatPage;
