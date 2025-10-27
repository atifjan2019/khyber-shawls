// components/ui/toast.tsx
"use client";

import { useEffect, useState } from "react";

type ToastProps = {
  message: string;
  show: boolean;
  onClose: () => void;
};

export function Toast({ message, show, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div
      className={`fixed bottom-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-transform duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      {message}
    </div>
  );
}
