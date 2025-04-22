import type { Snippet } from 'svelte';
import { writable } from 'svelte/store';

type ActionButtonData = {
  label: string;
  action?: () => void;
};

export type DialogData = {
  title?: string;
  content: Snippet;
  actions: ActionButtonData[];
};

export const dialogStore = writable<DialogData | null>(null);

export const openDialog = (data: DialogData): void => {
  dialogStore.set(data);
};
