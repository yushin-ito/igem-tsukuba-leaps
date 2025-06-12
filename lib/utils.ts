import type { Block } from "@/types";
import { type ClassValue, clsx } from "clsx";
import type { Element, Root } from "hast";
import type { RootContent } from "mdast";
import remarkParse from "remark-parse";
import { twMerge } from "tailwind-merge";
import { unified } from "unified";
import { visit } from "unist-util-visit";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const rehypeTypewriter = () => {
  let count = 0;

  return (tree: Root) => {
    visit(tree, "text", (node, index, parent) => {
      if (!parent || typeof index !== "number" || parent.type !== "element") {
        return;
      }

      // if (parent.tagName === "pre" || parent.tagName === "code") {
      //   return;
      // }

      const text = node.value;

      const nodes = text.split("").flatMap((character) => {
        const span: Element = {
          type: "element",
          tagName: "span",
          properties: {
            className: "animate-in fade-in duration-500",
          },
          children: [{ type: "text", value: character }],
        };
        count++;
        return span;
      });

      parent.children.splice(index, 1, ...nodes);

      return index + nodes.length;
    });
  };
};

export const parseMarkdownToBlocks = (markdown: string): Block[] => {
  if (!markdown) return [];

  const tree = unified().use(remarkParse).parse(markdown);

  return tree.children.map((node: RootContent) => {
    let source = "";
    if (
      node.position &&
      node.position.start.offset !== undefined &&
      node.position.end.offset !== undefined
    ) {
      source = markdown.substring(
        node.position.start.offset,
        node.position.end.offset,
      );
    }

    return {
      ...node,
      source,
    };
  }) as Block[];
};
