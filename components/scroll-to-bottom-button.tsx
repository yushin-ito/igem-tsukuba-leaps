"use client";

import Icons from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type ComponentProps,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

interface AnchorButtonProps extends ComponentProps<"button"> {
  anchorRef: RefObject<HTMLDivElement | null>;
}

const ScrollToBottomButton = ({
  anchorRef,
  className,
  ...props
}: AnchorButtonProps) => {
  const isMounted = useRef(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!anchorRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (isMounted.current) {
          isMounted.current = false;
          return;
        }
        setIsVisible(!entry.isIntersecting);
      },
      { root: null, threshold: 1 },
    );

    observer.observe(anchorRef.current);
    return () => observer.disconnect();
  }, [anchorRef]);

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("size-8 rounded-full ", className)}
      onClick={() => anchorRef.current?.scrollIntoView({ behavior: "smooth" })}
      {...props}
    >
      <Icons.arrowDown />
    </Button>
  );
};

export default ScrollToBottomButton;
