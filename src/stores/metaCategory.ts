import { derived, writable } from 'svelte/store';
import type { Category, OmitCommonFields } from './decr/types';

export type MetaCategory = {
  id: string;
  created: number;
  updated: number;
  published: boolean;
  isIncome: boolean;
  name: string;
  color: string;
  assignedMcc: { code: string; weight: number }[];
};

export const metaCategoryCacheKey = 'metaCategory',
  metaCategoryStore = writable<{ [id: string]: MetaCategory }>({});

export const categoriesFromMetaCategoriesStore = derived(metaCategoryStore, $metaCats =>
  Object.values($metaCats).map(metaCat => {
    const { isIncome, name, color, id: metaId } = metaCat;
    return {
      isIncome,
      name,
      color,
      metaId,
    } as OmitCommonFields<Category>;
  }),
);
