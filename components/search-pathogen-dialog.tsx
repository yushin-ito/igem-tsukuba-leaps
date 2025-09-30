import Icons from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Pathogen } from "@/types";
import type { DialogProps } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import * as R from "remeda";

interface SearchPathogenDialogProps extends DialogProps {
  pathogens: Pathogen[];
}

const SearchPathogenDialog = ({
  pathogens,
  ...props
}: SearchPathogenDialogProps) => {
  const locale = useLocale();
  const t = useTranslations("project");
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const collator = useMemo(
    () => new Intl.Collator(locale, { numeric: true, sensitivity: "base" }),
    [locale],
  );

  const debouncer = useMemo(
    () =>
      R.funnel(
        () => {
          setQuery(ref.current?.value ?? "");
        },
        { minQuietPeriodMs: 500 },
      ),
    [],
  );

  const results = useMemo(
    () =>
      pathogens
        .filter((pathogen) =>
          pathogen.name.toLowerCase().includes(query.trim().toLowerCase()),
        )
        .sort((a, b) =>
          collator.compare(a.name.replace("*", ""), b.name.replace("*", "")),
        ),
    [collator, pathogens, query],
  );

  const emify = useCallback((text: string) => {
    const parts = text.split("*");
    return parts.map((chunk, i) =>
      i % 2 === 1 ? (
        <em key={i.toString()} className="italic">
          {chunk}
        </em>
      ) : (
        chunk
      ),
    );
  }, []);

  return (
    <Dialog {...props}>
      <DialogContent className="flex aspect-[3/2] flex-col px-0 sm:max-w-xl sm:rounded-xl">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>{t("dialog.search.title")}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {t("dialog.search.description")}
          </DialogDescription>
        </VisuallyHidden>
        <div className="mx-6 space-y-4">
          <div className="relative">
            <Input
              ref={ref}
              placeholder={t("search_pathogen")}
              onChange={debouncer.call}
              className="!bg-transparent border-none pl-8 shadow-none focus-visible:ring-0 md:text-base"
            />
            <Icons.search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2 size-5 select-none opacity-50" />
          </div>
          <hr />
        </div>
        <div className="flex-1 overflow-y-auto px-6">
          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map((pathogen) => (
                <Link
                  key={pathogen.id}
                  href=""
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-auto w-full justify-start gap-2 px-3",
                  )}
                  onClick={() => props.onOpenChange?.(false)}
                >
                  <p className="no-scrollbar overflow-x-auto">
                    {emify(pathogen.name)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center space-y-3">
              <div className="flex size-20 items-center justify-center rounded-full bg-muted">
                <Icons.search className="size-10 text-muted-foreground" />
              </div>
              <div className="space-y-2 text-center">
                <h2 className="font-semibold text-lg">
                  {t("empty_placeholder.title")}
                </h2>
                <p className="text-center text-muted-foreground text-sm">
                  {t("empty_placeholder.description")}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchPathogenDialog;
