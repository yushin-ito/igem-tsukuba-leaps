import Icons from "@/components/icons";
import LanguageSwitcher from "@/components/language-switcher";
import ModeToggle from "@/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import Link from "next/link";

const ProjectHeader = () => {
  return (
    <header className="absolute inset-x-0 top-0 flex items-center justify-between bg-background pt-3 pr-6 pb-2 pl-3">
      <SidebarTrigger />
      <div className="flex items-center space-x-2">
        <Link
          href={siteConfig.links.github}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "ghost" }), "size-8")}
        >
          <Icons.github className="dark:fill-white" />
        </Link>
        <ModeToggle />
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default ProjectHeader;
