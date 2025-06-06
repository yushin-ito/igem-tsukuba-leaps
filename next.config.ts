import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import "@/env";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
};

export default withNextIntl(nextConfig);
