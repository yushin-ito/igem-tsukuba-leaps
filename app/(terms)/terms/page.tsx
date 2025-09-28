import { getLocale } from "next-intl/server";

const TermsPage = async () => {
  const locale = await getLocale();
  const { default: Terms } = await import(`@/markdown/terms/${locale}.mdx`);

  return (
    <section className="container py-12">
      <div className="prose dark:prose-invert mx-auto max-w-3xl">
        <Terms />
      </div>
    </section>
  );
};

export default TermsPage;
