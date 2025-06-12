"use client";

import { rehypeTypewriter } from "@/lib/utils";
import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Markdown = (props: ComponentProps<typeof ReactMarkdown>) => {
  return (
    <div className="prose dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeTypewriter]}
        {...props}
      />
    </div>
  );
};

export default Markdown;
