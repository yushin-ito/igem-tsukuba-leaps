import Icons from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";

interface CodeBlockProps {
  children: ReactNode;
}

const CodeBlock = ({ children }: CodeBlockProps) => {
  const t = useTranslations("chat");
  const [isCopied, setIsCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(children));
      setIsCopied(true);
      toast.success(t("success.copy"));
      setTimeout(() => setIsCopied(false), 5000);
    } catch (error) {
      toast.error(t("error.copy.title"), {
        description: t("error.copy.description"),
      });
    }
  };

  return (
    <div className="my-4 space-y-2 rounded-md border bg-secondary pt-0.5 pb-6">
      <div className="flex items-center justify-between px-4">
        <span className="text-secondary-foreground text-xs"> {t("file")}</span>
        <Button
          variant="ghost"
          className="!px-1 gap-1 text-secondary-foreground text-xs [&_svg:not([class*='size-'])]:size-4"
          onClick={onCopy}
        >
          {isCopied ? (
            <>
              <Icons.check />
              {t("copied")}
            </>
          ) : (
            <>
              <Icons.copy />
              {t("copy")}
            </>
          )}
        </Button>
      </div>
      <pre className="px-6">
        <code className="text-secondary-foreground text-sm">{children}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
