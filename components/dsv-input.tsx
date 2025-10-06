import { Textarea } from "@/components/ui/textarea";
import { type ComponentProps, Fragment, useMemo, useRef } from "react";

interface DSVInputProps extends Omit<ComponentProps<"textarea">, "rows"> {
  headers: string[];
  rows: string[][];
  delimiter: string;
}

const DSVInput = ({ headers, rows, delimiter, ...props }: DSVInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const nodes = useMemo(() => {
    const lines: string[][] = headers.length ? [headers, ...rows] : rows;

    return lines.map((line, i) => {
      if (line[0] === "") {
        return <br key={i.toString()} />;
      }

      return (
        <Fragment key={i.toString()}>
          {line.map((cell, j) => (
            <Fragment key={j.toString()}>
              <span
                className={
                  j % 2 === 0 ? "text-foreground" : "text-muted-foreground"
                }
              >
                {cell}
              </span>
              {j < line.length - 1 && (
                <span
                  className={
                    j % 2 === 0 ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  {delimiter === "\t" ? "\\t" : delimiter}
                </span>
              )}
            </Fragment>
          ))}
          {i < lines.length - 1 && <br />}
        </Fragment>
      );
    });
  }, [headers, rows, delimiter]);

  return (
    <div className="relative rounded-md border border-input focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
      <pre
        ref={preRef}
        className="absolute inset-0 overflow-auto whitespace-pre px-3 py-2 font-mono text-sm"
      >
        <code className="leading-relaxed">{nodes}</code>
      </pre>
      <Textarea
        className="no-scrollbar relative h-[320px] resize-none overflow-auto whitespace-pre rounded-none border-none font-mono text-sm text-transparent leading-relaxed caret-foreground shadow-none focus-visible:ring-0"
        ref={(event) => {
          textareaRef.current = event;
        }}
        onScroll={(event) => {
          if (preRef.current) {
            preRef.current.scrollTop = event.currentTarget.scrollTop;
            preRef.current.scrollLeft = event.currentTarget.scrollLeft;
          }
        }}
        {...props}
      />
    </div>
  );
};

export default DSVInput;
