import { readable } from 'svelte/store';
import { request } from '$services/request';

type Currency = { label: string; code: string };

export const currencyListStore = readable<Currency[] | null>(null, set => {
  request<Currency[]>({ path: '/directory/currency/all' }).then(({ json }) => set(json));
});
