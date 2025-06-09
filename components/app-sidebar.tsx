"use client";

import DeleteDialog from "@/components/delete-dialog";
import Icons from "@/components/icons";
import NavUser from "@/components/nav-user";
import RenameDialog from "@/components/rename-dialog";
import SearchDialog from "@/components/search-dialog";
import ShareDialog from "@/components/share-dialog";
import { buttonVariants } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useDialog } from "@/hooks/use-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { Room, User } from "@prisma/client";
import { differenceInDays, isToday, isYesterday } from "date-fns";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { useMemo } from "react";
import * as R from "remeda";
import useSWR from "swr";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface DialogPayload {
  search: undefined;
  rename: { title: string; roomId: string };
  share: { roomId: string };
  delete: { roomId: string };
}

interface AppSidebarProps {
  user: Pick<User, "name" | "email" | "image">;
  rooms: Room[];
}

const AppSidebar = ({ user, rooms }: AppSidebarProps) => {
  const t = useTranslations("chat");
  const segment = useSelectedLayoutSegment();
  const isMobile = useIsMobile();

  const { open, state, getDialogProps } = useDialog<DialogPayload>();

  const key = "/api/rooms";

  const fetcher = async (url: string) => {
    const response = await fetch(url);
    return await response.json();
  };

  const { data } = useSWR<Room[]>(key, fetcher, {
    fallbackData: rooms,
  });

  const result = useMemo(() => {
    const order = [t("today"), t("yesterday"), t("last_week"), t("earlier")];

    return R.pipe(
      R.groupBy(data ?? [], (room) => {
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
  }, [data, t]);

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between p-2">
            <Link href="/">
              <div className="flex aspect-square size-7.5 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Icons.logo className="size-5" />
              </div>
            </Link>
            <Link
              href="/chat"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "rounded-full",
              )}
            >
              <Icons.squarePen className="size-4.5" />
            </Link>
          </div>
        </SidebarHeader>
        <SidebarContent className="space-y-4">
          <SidebarGroup>
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/chat">
                    <Icons.squarePen />
                    {t("new_chat")}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() =>
                    open({
                      type: "search",
                      data: undefined,
                    })
                  }
                >
                  <Icons.search />
                  {t("search_chat")}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          {Object.keys(result).length !== 0 &&
            Object.entries(result).map(([key, items]) => (
              <SidebarGroup key={key}>
                <SidebarGroupLabel>{key}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {items.map((item) => {
                      const isActive = segment === item.id;

                      return (
                        <DropdownMenu key={item.id}>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              className="group/button data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground [&_svg:not([class*='size-'])]:size-4"
                            >
                              <Link href={`/chat/${item.id}`}>
                                {item.title}
                                <DropdownMenuTrigger asChild>
                                  <Icons.ellipsis className="ml-auto opacity-0 transition-opacity group-hover/button:opacity-100 data-[state=open]:opacity-100" />
                                </DropdownMenuTrigger>
                              </Link>
                            </SidebarMenuButton>

                            <DropdownMenuContent
                              side={isMobile ? "bottom" : "right"}
                              align={isMobile ? "end" : "start"}
                              className="min-w-56 rounded-lg"
                            >
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  onSelect={() =>
                                    open({
                                      type: "rename",
                                      data: {
                                        title: item.title,
                                        roomId: item.id,
                                      },
                                    })
                                  }
                                >
                                  <Icons.pencil className="text-foreground" />
                                  {t("rename")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() =>
                                    open({
                                      type: "share",
                                      data: { roomId: item.id },
                                    })
                                  }
                                >
                                  <Icons.share className="text-foreground" />
                                  {t("share")}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Icons.archive className="text-foreground" />
                                  {t("archaive")}
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={() =>
                                  open({
                                    type: "delete",
                                    data: { roomId: item.id },
                                  })
                                }
                              >
                                <Icons.trash className="text-destructive" />
                                <span>{t("delete")}</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </SidebarMenuItem>
                        </DropdownMenu>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
      </Sidebar>
      <SearchDialog {...getDialogProps("search")} />
      <RenameDialog
        {...getDialogProps("rename")}
        roomId={state.type === "rename" ? state.data.roomId : ""}
        title={state.type === "rename" ? state.data.title : ""}
      />
      <ShareDialog
        {...getDialogProps("share")}
        roomId={state.type === "share" ? state.data.roomId : ""}
      />
      <DeleteDialog
        {...getDialogProps("delete")}
        roomId={state.type === "delete" ? state.data.roomId : ""}
      />
    </>
  );
};

export default AppSidebar;
