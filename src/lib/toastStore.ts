import { writable } from 'svelte/store';

export type Level = 'info' | 'success' | 'warning' | 'error';

type ToastData = {
  level: Level;
  message: string;
};

export const toastStore = writable<ToastData | null>(null);

export const raiseToast = (data: ToastData): void => {
  toastStore.set(data);
};
