import type { AppData } from './types';

let cache: AppData | null = null;

export async function loadData(): Promise<AppData> {
  if (cache) return cache;
  const res = await fetch('./data/papers.json');
  if (!res.ok) throw new Error(`Failed to load data: ${res.status}`);
  cache = (await res.json()) as AppData;
  return cache;
}
