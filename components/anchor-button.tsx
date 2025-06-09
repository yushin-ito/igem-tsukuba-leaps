"use client";

import Icons from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface AnchorButtonProps {
  target: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

const AnchorButton = ({ target, className }: AnchorButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const isOnce = useRef(true);

  useEffect(() => {
    if (!target.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (isOnce.current) {
          isOnce.current = false;
          return;
        }
        setIsVisible(!entry.isIntersecting);
      },
      { root: null, threshold: 1 },
    );

    observer.observe(target.current);
    return () => observer.disconnect();
  }, [target]);

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("size-8 rounded-full", className)}
      onClick={() => target.current?.scrollIntoView({ behavior: "smooth" })}
    >
      <Icons.arrowDown />
    </Button>
  );
};

export default AnchorButton;
