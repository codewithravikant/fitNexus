'use client';

import { useState, useCallback, useEffect } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

let listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

function dispatch(newToast: Toast) {
  memoryState = {
    toasts: [...memoryState.toasts, newToast],
  };
  listeners.forEach((listener) => listener(memoryState));

  setTimeout(() => {
    memoryState = {
      toasts: memoryState.toasts.filter((t) => t.id !== newToast.id),
    };
    listeners.forEach((listener) => listener(memoryState));
  }, newToast.duration || 5000);
}

export function toast(props: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2, 9);
  dispatch({ ...props, id });
}

export function useToast() {
  const [state, setState] = useState<ToastState>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      listeners = listeners.filter((l) => l !== setState);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    memoryState = {
      toasts: memoryState.toasts.filter((t) => t.id !== id),
    };
    listeners.forEach((listener) => listener(memoryState));
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss,
  };
}
