import { useReducer } from "react";

type DialogState<T extends object> =
  | { type: null }
  | { [K in keyof T]: { type: K; data: T[K] } }[keyof T];

type DialogAction<T extends object> =
  | { type: "OPEN"; payload: Exclude<DialogState<T>, { type: null }> }
  | { type: "CLOSE" };

const reducer = <T extends object>(
  _state: DialogState<T>,
  action: DialogAction<T>,
): DialogState<T> => {
  switch (action.type) {
    case "OPEN":
      return action.payload;
    case "CLOSE":
      return { type: null };
    default:
      throw new Error();
  }
};

export const useDialog = <T extends object>() => {
  const [state, dispatch] = useReducer(reducer<T>, { type: null });

  const open = (payload: Exclude<DialogState<T>, { type: null }>) => {
    dispatch({ type: "OPEN", payload });
  };

  const close = () => {
    dispatch({ type: "CLOSE" });
  };

  const getDialogProps = <K extends keyof T>(type: K) => {
    const isOpen = state.type === type;

    const onOpenChange = (open: boolean) => {
      if (!open) {
        close();
      }
    };

    if (!isOpen) {
      return {
        open: false,
        onOpenChange,
      };
    }

    if ("data" in state) {
      return { open: true, onOpenChange, ...state.data };
    }

    return { open: true, onOpenChange };
  };

  return { state, open, close, getDialogProps };
};
