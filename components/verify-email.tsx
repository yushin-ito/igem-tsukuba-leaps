import { siteConfig } from "@/config/site";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { getTranslations } from "next-intl/server";

interface VerifyEmailProps {
  url: string;
}

const VerifyEmail = async ({ url }: VerifyEmailProps) => {
  const t = await getTranslations("email");

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body>
          <Preview>{t("preview")}</Preview>
          <Container className="mx-auto my-8 max-w-md rounded-xl border border-zinc-200 border-solid bg-white px-12 pt-8 pb-2 text-center shadow">
            <Section>
              <Img
                src={`${siteConfig.url}/images/logo.png`}
                width="84"
                height="84"
                alt="icon"
                className="mx-auto rounded-full"
              />
            </Section>
            <Section>
              <Heading className="mt-4 mb-6 font-bold text-xl">
                {t("title")}
              </Heading>
              <Text className="whitespace-pre-line text-left">
                {t("description")}
              </Text>
              <Text className="whitespace-pre-line text-left">
                {t.rich("instruction", {
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </Text>
              <Button
                href={url}
                className="mt-8 mb-4 w-4/5 rounded-md bg-zinc-900 py-3 font-medium text-sm text-zinc-50 shadow"
              >
                {t("verify")}
              </Button>
              <Text className="whitespace-pre-line text-left text-xs text-zinc-500">
                {t("warning")}
              </Text>
              <Text className="mt-2 text-left text-xs text-zinc-500">
                {t.rich("support", {
                  link: (chunks) => (
                    <Link
                      href={`mailto:support@${siteConfig.domain}`}
                      className="underline underline-offset-2"
                    >
                      {chunks}
                    </Link>
                  ),
                  domain: siteConfig.domain,
                })}
              </Text>
            </Section>
            <Section className="mt-4">
              <Text className="text-center text-xs text-zinc-500">
                {t.rich("footer", {
                  year: new Date().getFullYear(),
                  link: (chunks) => (
                    <Link
                      href={siteConfig.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2"
                    >
                      {chunks}
                    </Link>
                  ),
                  name: siteConfig.organization,
                })}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VerifyEmail;
