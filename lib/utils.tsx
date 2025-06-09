import { type ClassValue, clsx } from "clsx";
import { Fragment, type ReactElement, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const rich = (
  text: string,
  options: {
    components: {
      [key: string]: (chunks?: string) => ReactElement;
    };
    values?: {
      [key: string]: string | number;
    };
  },
): ReactNode => {
  const { components, values } = options;

  let tmp = text;
  if (values) {
    for (const [key, value] of Object.entries(values)) {
      tmp = tmp.replace(new RegExp(`{${key}}`, "g"), String(value));
    }
  }

  const keys = Object.keys(components);
  if (keys.length === 0) {
    return tmp;
  }

  const regex = new RegExp(
    `(${keys.map((key) => `<${key}>.*?<\\/${key}>|<${key}\\s*\\/>`).join("|")})`,
    "g",
  );

  const parts = tmp.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) {
          return null;
        }

        for (const key of keys) {
          const Component = components[key];

          const regex2 = new RegExp(`^<${key}\\s*\\/>$`);
          if (regex2.test(part)) {
            return <Fragment key={index.toString()}>{Component()}</Fragment>;
          }

          const start = `<${key}>`;
          const end = `</${key}>`;
          if (part.startsWith(start) && part.endsWith(end)) {
            const chunks = part.slice(start.length, -end.length);
            return (
              <Fragment key={index.toString()}>{Component(chunks)}</Fragment>
            );
          }
        }

        return <Fragment key={index.toString()}>{part}</Fragment>;
      })}
    </>
  );
};
