import { auth } from "@/auth";
import ProjectForm from "@/components/project-form";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { notFound, unauthorized } from "next/navigation";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

const ProjectPage = async ({ params }: ProjectPageProps) => {
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
      <ProjectForm project={project} />
    </section>
  );
};

export default ProjectPage;
