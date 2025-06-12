import type { Block } from "@/types";
import { useEffect, useMemo, useReducer, useRef } from "react";

type State = {
  blocks: Block[];
  position: number;
  index: number;
  acc: string;
  text: string;
};

type Action =
  | { type: "tick"; blocks: Block[] }
  | { type: "next"; blocks: Block[] }
  | { type: "reset"; blocks: Block[] };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "reset": {
      return {
        blocks: action.blocks,
        position: 0,
        index: 0,
        acc: "",
        text: "",
      };
    }

    case "tick": {
      const block = state.blocks[state.position];

      if (block.type === "code") {
        const opening = `\`\`\`${block.lang || ""}\n`;
        const closing = "\n```";

        const text =
          state.acc + opening + block.value.slice(0, state.index + 1) + closing;

        return {
          ...state,
          index: state.index + 1,
          text,
        };
      }

      const text = state.acc + block.source.slice(0, state.index + 1);

      return {
        ...state,
        index: state.index + 1,
        text,
      };
    }

    case "next": {
      let acc = state.acc + state.blocks[state.position].source;
      if (state.position < state.blocks.length - 1) acc += "\n\n";

      const block = state.blocks[state.position + 1];

      let text = acc;
      if (block && block.type === "code") {
        text += `\`\`\`${block.lang || ""}\n\`\`\``;
      }

      return {
        ...state,
        position: state.position + 1,
        index: 0,
        acc,
        text,
      };
    }

    default:
      return state;
  }
};

interface TypewriterOptions {
  cursor?: string;
  interval?: number;
  speed?: number;
  onDone?: () => void;
}

export const useTypewriter = (blocks: Block[], options?: TypewriterOptions) => {
  const { cursor = "|", interval = 300, speed = 20, onDone } = options || {};
  const isMounted = useRef(false);
  const [state, dispatch] = useReducer(reducer, {
    blocks,
    position: 0,
    index: 0,
    acc: "",
    text: "",
  });

  useEffect(() => {
    dispatch({ type: "reset", blocks });
  }, [blocks]);

  useEffect(() => {
    if (state.blocks.length === 0) {
      return;
    }

    const current = state.blocks[state.position];
    if (!current) {
      return;
    }

    const limit =
      current.type === "code" ? current.value.length : current.source.length;

    const isPending = state.index < limit;

    const timer = setTimeout(
      () =>
        dispatch({
          type: isPending ? "tick" : "next",
          blocks,
        }),
      isPending ? speed : interval,
    );

    return () => clearTimeout(timer);
  }, [state, blocks, interval, speed]);

  const isDone = useMemo(() => {
    if (state.blocks.length === 0 || state.position >= state.blocks.length) {
      return true;
    }

    const current = state.blocks[state.position];
    const length =
      current.type === "code" ? current.value.length : current.source.length;

    return state.position === state.blocks.length - 1 && state.index >= length;
  }, [state]);

  useEffect(() => {
    if (isDone && !isMounted.current) {
      onDone?.();
      isMounted.current = true;
    }
  }, [isDone, onDone]);

  return { text: state.text, isDone };
};
