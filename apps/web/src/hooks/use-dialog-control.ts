import { useCallback, useState } from "react";

interface UseDialogControlReturn<T> {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  open: (data?: T) => void;
  close: () => void;
  data: T | undefined;
}

export function useDialogControl<T = any>(): UseDialogControlReturn<T> {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<T | undefined>(undefined);

  const open = useCallback((initialData?: T) => {
    setData(initialData);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setData(undefined);
  }, []);

  return {
    visible,
    setVisible,
    open,
    close,
    data,
  };
}
