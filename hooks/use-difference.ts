import { useEffect, useMemo, useRef } from "react";

export const useDifference = (next: string[]) => {
  const ref = useRef<string[]>(null);

  const diff = useMemo(() => {
    const prev = ref.current ?? [];

    const added = next.filter((value) => !new Set(prev).has(value));
    const removed = prev.filter((value) => !new Set(next).has(value));

    return { added, removed };
  }, [next]);

  useEffect(() => {
    ref.current = next;
  }, [next]);

  return diff;
};
