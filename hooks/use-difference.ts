import { useEffect, useMemo, useRef } from "react";

export const useDifference = (next: string[]) => {
  const ref = useRef<string[]>(null);

  const diff = useMemo(() => {
    const prev = ref.current ?? [];

    const before = new Set(prev);
    const after = new Set(next);

    const added = next.filter((value) => !before.has(value));
    const removed = prev.filter((value) => !after.has(value));

    return { added, removed };
  }, [next]);

  useEffect(() => {
    ref.current = next;
  }, [next]);

  return diff;
};
