import {
  Children,
  type ReactNode,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useState,
} from "react";

const getText = (children: ReactNode): string => {
  if (typeof children === "string" || typeof children === "number") {
    return children.toString();
  }
  if (Array.isArray(children)) {
    return children.map(getText).join("");
  }
  if (isValidElement(children)) {
    const props = children.props as { children?: ReactNode };
    return getText(props.children);
  }
  return "";
};

const getNode = (children: ReactNode, count: { value: number }): ReactNode => {
  if (count.value <= 0 || children == null) {
    return null;
  }

  if (Array.isArray(children)) {
    return Children.map(children, (child) => getNode(child, count));
  }

  if (typeof children === "string" || typeof children === "number") {
    const text = children.toString();
    const length = Math.min(text.length, count.value);

    count.value -= length;

    return text
      .substring(0, length)
      .split("")
      .map((char, index) => {
        if (char === " ") {
          return " ";
        }
        return (
          <span key={index.toString()} className="fade-in animate-in">
            {char}
          </span>
        );
      });
  }

  if (isValidElement(children)) {
    const props = children.props as { children?: ReactNode };

    if (props.children == null) {
      return children;
    }

    const node = getNode(props.children, count);

    if (node === null) {
      return null;
    }

    return cloneElement(
      children,
      children.props as Record<string, unknown>,
      node,
    );
  }

  return null;
};

interface UseTypewriterProps {
  children: ReactNode;
  speed?: number;
  cursor?: string;
  onStart?: () => void;
  onDone?: () => void;
}

export const useTypewriter = ({
  children,
  speed = 50,
  cursor = "",
  onDone,
}: UseTypewriterProps) => {
  const text = useMemo(() => getText(children), [children]);
  const length = text.length;

  const [count, setCount] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (count >= length) {
      if (!isDone) {
        onDone?.();
        setIsDone(true);
      }
      return;
    }

    const timer = setTimeout(() => {
      setCount((prevCount) => prevCount + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [count, length, speed, onDone, isDone]);

  const node = useMemo(() => {
    if (isDone) return children;
    if (count === 0) return null;

    return getNode(children, { value: count });
  }, [count, children, isDone]);

  return { node, cursor: isDone ? "" : cursor };
};
