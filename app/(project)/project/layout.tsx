import { auth } from "@/auth";
import AppSidebar from "@/components/app-sidebar";
import ProjectHeader from "@/components/project-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { db } from "@/lib/db";
import { unauthorized } from "next/navigation";
import type { ReactNode } from "react";

interface ProjectLayoutProps {
  children: ReactNode;
}

const ProjectLayout = async ({ children }: ProjectLayoutProps) => {
  const session = await auth();

  if (!session?.user) {
    unauthorized();
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      image: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    unauthorized();
  }

  const projects = await db.project.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <SidebarProvider>
      <AppSidebar user={user} projects={projects} />
      <main className="relative flex-1 overflow-hidden">
        <ProjectHeader />
        {children}
      </main>
    </SidebarProvider>
  );
};

export default ProjectLayout;
