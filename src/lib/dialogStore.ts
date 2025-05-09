import type { Snippet } from 'svelte';
import { writable } from 'svelte/store';

type ActionButtonData = {
  label: string;
  action?: (() => Promise<void>) | (() => undefined) | (() => void);
};

export type DialogData = {
  title?: string;
  content: Snippet | string;
  actions?: ActionButtonData[];
};

export const dialogStore = writable<DialogData | null>(null);

export const openDialog = (data: DialogData): void => {
  dialogStore.set(data);
};
