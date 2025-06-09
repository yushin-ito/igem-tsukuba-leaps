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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Room } from "@prisma/client";
import type { DialogProps } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { differenceInDays, isToday, isYesterday } from "date-fns";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import * as R from "remeda";
import useSWR from "swr";

const SearchDialog = (props: DialogProps) => {
  const t = useTranslations("chat");
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLInputElement>(null);

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

  const fetcher = async (url: string) => {
    const response = await fetch(url);
    return response.json();
  };

  const { data, isLoading } = useSWR<Room[]>(
    `/api/rooms?query=${query}`,
    fetcher,
  );

  const result = useMemo(() => {
    const order = [t("today"), t("yesterday"), t("last_week"), t("earlier")];
    const source = query ? data : data?.slice(0, 5);

    return R.pipe(
      source ?? [],
      R.groupBy((room) => {
        if (isToday(room.updatedAt)) {
          return t("today");
        }
        if (isYesterday(room.updatedAt)) {
          return t("yesterday");
        }
        if (differenceInDays(new Date(), room.updatedAt) <= 7) {
          return t("last_week");
        }
        return t("earlier");
      }),
      R.mapValues((group) =>
        R.sortBy(group, (room) => -new Date(room.updatedAt).getTime()),
      ),
      R.entries(),
      R.sortBy(([label]) => order.indexOf(label)),
      R.fromEntries(),
    );
  }, [data, t, query]);

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
              placeholder={t("search_chat")}
              onChange={debouncer.call}
              className="border-none pl-8 shadow-none focus-visible:ring-0 md:text-base"
            />
            <Icons.search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2 size-5 select-none opacity-50" />
          </div>
          <hr />
          {!query && (
            <Link
              href="/chat"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "!px-3 h-10 w-full justify-start gap-2",
              )}
              onClick={() => props.onOpenChange?.(false)}
            >
              <Icons.squarePen className="size-5 text-muted-foreground" />
              <div className="truncate">{t("new_chat")}</div>
            </Link>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-6">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index.toString()}
                  className="flex h-10 items-center space-x-2 px-3"
                >
                  <Skeleton className="size-5 rounded-full" />
                  <Skeleton className="h-4 w-[180px] rounded-full" />
                </div>
              ))}
            </div>
          ) : Object.keys(result).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(result).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <p className="px-3 font-semibold text-muted-foreground text-xs">
                    {key}
                  </p>
                  {value.map((room) => (
                    <Link
                      key={room.id}
                      href={`/chat/${room.id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "!px-3 h-10 w-full justify-start gap-2",
                      )}
                      onClick={() => props.onOpenChange?.(false)}
                    >
                      <Icons.chat className="size-5 text-muted-foreground" />
                      <div className="truncate">{room.title}</div>
                    </Link>
                  ))}
                </div>
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

export default SearchDialog;
