import Icons from "@/components/icons";
import LanguageSwitcher from "@/components/language-switcher";
import ModeToggle from "@/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import Link from "next/link";

const Header = () => {
  return (
    <div className="flex h-12 items-center justify-between px-4 md:h-16 md:px-10">
      <Link href="/" className="flex items-center space-x-2">
        <Icons.logo className="size-7" />
        <span className="hidden font-bold md:block">{siteConfig.name}</span>
      </Link>
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
    </div>
  );
};

export default Header;
