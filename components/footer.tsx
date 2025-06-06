import Link from "next/link";

import { siteConfig } from "@/config/site";

const Footer = () => {
  return (
    <div className="h-6">
      <p className="text-center text-muted-foreground text-xs md:text-sm">
        &copy; {new Date().getFullYear()}{" "}
        <Link
          href={siteConfig.links.github}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          {siteConfig.organization}
        </Link>{" "}
        {/* All rights reserved. */}
      </p>
    </div>
  );
};

export default Footer;
