"use client";

import DeleteProjectDialog from "@/components/delete-project-dialog";
import Icons from "@/components/icons";
import NavUser from "@/components/nav-user";
import SearchProjectDialog from "@/components/search-project-dialog";
import ShareProjectDialog from "@/components/share-project-dialog";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import UpdateProjectDialog from "@/components/update-project-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn, fetcher } from "@/lib/utils";
import type { Project, User } from "@prisma/client";
import { differenceInDays, isToday, isYesterday } from "date-fns";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { useMemo } from "react";
import * as R from "remeda";
import useSWR from "swr";

interface DialogPayload {
  search: undefined;
  rename: { name: string; projectId: string };
  share: { projectId: string };
  delete: { projectId: string };
}

interface AppSidebarProps {
  user: Pick<User, "name" | "email" | "image">;
  projects: Project[];
}

const AppSidebar = ({ user, projects }: AppSidebarProps) => {
  const t = useTranslations("project");
  const segment = useSelectedLayoutSegment();
  const isMobile = useIsMobile();

  const { open, state, getDialogProps } = useDialog<DialogPayload>();

  const { data } = useSWR<Project[]>("/api/projects", fetcher, {
    fallbackData: projects,
  });

  const result = useMemo(() => {
    const order = [t("today"), t("yesterday"), t("last_week"), t("earlier")];

    return R.pipe(
      R.groupBy(data ?? [], (project) => {
        if (isToday(project.updatedAt)) {
          return t("today");
        }
        if (isYesterday(project.updatedAt)) {
          return t("yesterday");
        }
        if (differenceInDays(new Date(), project.updatedAt) <= 7) {
          return t("last_week");
        }

        return t("earlier");
      }),
      R.mapValues((group) =>
        R.sortBy(group, (project) => -new Date(project.updatedAt).getTime()),
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
              href="/project"
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
                  <Link href="/project">
                    <Icons.squarePen />
                    {t("new_project")}
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
                  {t("search_project")}
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
                              <Link href={`/project/${item.id}`}>
                                {item.name}
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
                                        name: item.name,
                                        projectId: item.id,
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
                                      data: { projectId: item.id },
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
                                    data: { projectId: item.id },
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
      <SearchProjectDialog {...getDialogProps("search")} />
      <UpdateProjectDialog
        {...getDialogProps("rename")}
        projectId={state.type === "rename" ? state.data.projectId : ""}
        name={state.type === "rename" ? state.data.name : ""}
      />
      <ShareProjectDialog
        {...getDialogProps("share")}
        projectId={state.type === "share" ? state.data.projectId : ""}
      />
      <DeleteProjectDialog
        {...getDialogProps("delete")}
        projectId={state.type === "delete" ? state.data.projectId : ""}
      />
    </>
  );
};

export default AppSidebar;
