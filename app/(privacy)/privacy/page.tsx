import { getLocale } from "next-intl/server";

const PrivacyPage = async () => {
  const locale = await getLocale();
  const { default: Privacy } = await import(`@/markdown/privacy/${locale}.mdx`);

  return (
    <section className="container py-12">
      <div className="prose dark:prose-invert mx-auto max-w-3xl">
        <Privacy />
      </div>
    </section>
  );
};

export default PrivacyPage;
