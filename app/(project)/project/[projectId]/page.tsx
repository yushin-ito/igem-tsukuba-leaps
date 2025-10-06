import { promises as fs } from "node:fs";
import path from "node:path";
import { auth } from "@/auth";
import Leaderboard from "@/components/leaderboard";
import ProjectForm from "@/components/project-form";
import StatusCard from "@/components/status-card";
import { db } from "@/lib/db";
import { pathogenSchema } from "@/schemas/project";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound, unauthorized } from "next/navigation";
import z from "zod/v4";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

const ProjectPage = async ({ params }: ProjectPageProps) => {
  const locale = await getLocale();
  const t = await getTranslations("project");
  const session = await auth();
  const { projectId } = await params;

  if (!session?.user) {
    unauthorized();
  }

  const project = await db.project.findFirst({
    where: {
      id: projectId,
      userId: session.user.id,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!project) {
    notFound();
  }

  const tasks = await db.task.findMany({
    where: {
      projectId: project.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const file = await fs.readFile(
    path.join(process.cwd(), "public", "data", "pathogen.json"),
    "utf8",
  );
  const data = JSON.parse(file);
  const pathogens = z.array(pathogenSchema).parse(data[locale]);

  return (
    <section className="container max-w-4xl space-y-4 py-16">
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="font-bold text-lg md:text-xl">
            {project?.name ?? t("untitled_project")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("metadata.description")}
          </p>
        </div>
        <hr />
      </div>
      <div className="space-y-12">
        <ProjectForm project={project} tasks={tasks} pathogens={pathogens} />
        <StatusCard project={project} tasks={tasks} />
        <Leaderboard project={project} tasks={tasks} />
      </div>
    </section>
  );
};

export default ProjectPage;
