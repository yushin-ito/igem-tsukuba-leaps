import { useTypewriter } from "@/hooks/use-typewriter";
import type { ReactNode } from "react";

interface TypewriterProps {
  children: ReactNode;
  speed?: number;
  className?: string;
  onDone?: () => void;
}

const Typewriter = (props: TypewriterProps) => {
  const { node, cursor } = useTypewriter(props);

  return (
    <span className={props.className}>
      {node}
      {cursor}
    </span>
  );
};

export default Typewriter;
