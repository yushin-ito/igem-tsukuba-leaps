import type { formats } from "@/i18n/request";
import type messages from "@/messages/en.json";

const locales = ["en", "ja"] as const;

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof locales)[number];
    Messages: typeof messages;
    Formats: typeof formats;
  }
}
