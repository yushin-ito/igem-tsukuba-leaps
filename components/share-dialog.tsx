"use client";

import Icons from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/config/site";
import type { DialogProps } from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface ShareDialogProps extends DialogProps {
  roomId: string;
}

const ShareDialog = ({ roomId, ...props }: ShareDialogProps) => {
  const link = `${siteConfig.url}/${roomId}`;

  const t = useTranslations("chat");

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success(t("success.copy"));
      props.onOpenChange?.(false);
    } catch (error) {
      toast.error(t("error.copy.title"), {
        description: t("error.copy.description"),
      });
    }
  };

  return (
    <Dialog {...props}>
      <DialogTrigger />
      <DialogContent className="gap-6">
        <DialogHeader>
          <DialogTitle>{t("dialog.share.title")}</DialogTitle>
          <DialogDescription>{t("dialog.share.description")}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              {t("link")}
            </Label>
            <div className="relative">
              <Input
                id="link"
                defaultValue={link}
                readOnly
                className="h-auto p-3 pr-12 focus-visible:ring-0"
              />
              <Button
                variant="outline"
                size="icon"
                className="-translate-y-1/2 absolute top-1/2 right-2 size-8"
                onClick={onCopy}
              >
                <Icons.copy className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
