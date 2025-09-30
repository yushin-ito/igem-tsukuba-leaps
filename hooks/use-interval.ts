import { useEffect } from "react";

const useInterval = (callback: () => void, delay: number | null) => {
  useEffect(() => {
    if (delay !== null) {
      const interval = setInterval(() => callback(), delay || 0);
      return () => clearInterval(interval);
    }

    return undefined;
  }, [delay, callback]);
};

export default useInterval;
