import { setup } from 'svelte-match-media';

// Those are taken from Bulma's $tablet variable
export const matchMediaInit = () =>
  setup({
    mobile: 'screen and (max-width: 769px)',
  });
