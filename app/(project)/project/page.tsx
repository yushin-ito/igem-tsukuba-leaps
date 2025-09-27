import CreateProjectButton from "@/components/create-project-button";
import { siteConfig } from "@/config/site";
import { getTranslations } from "next-intl/server";

const ProjectPage = async () => {
  const t = await getTranslations("project");

  return (
    <section className="flex min-h-screen flex-col items-center justify-center space-y-12">
      <h1 className="font-semibold text-3xl">
        {t("welcome", { name: siteConfig.name })}
      </h1>
      <div className="container max-w-2xl">
        <CreateProjectButton />
      </div>
    </section>
  );
};

export default ProjectPage;
