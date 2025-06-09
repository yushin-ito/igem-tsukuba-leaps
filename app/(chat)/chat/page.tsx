import NewChatInput from "@/components/new-chat-input";
import { siteConfig } from "@/config/site";
import { getTranslations } from "next-intl/server";

const ChatPage = async () => {
  const t = await getTranslations("chat");

  return (
    <section className="container flex min-h-screen max-w-5xl flex-col items-center justify-center space-y-12">
      <h1 className="font-semibold text-3xl">
        {t("welcome", { name: siteConfig.name })}
      </h1>
      <NewChatInput />
    </section>
  );
};

export default ChatPage;
