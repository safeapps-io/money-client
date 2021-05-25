<script>
  import type { SearchFilter, FullEntity } from '$stores/decr/types';

  import { goto } from '$app/navigation';
  import { tick } from 'svelte';
  import { slide } from 'svelte/transition';

  import SearchFilterForm from '$components/searchFilter/form.svelte';

  import { searchIdPathFn } from '$core/routes';

  export let searchFilter: FullEntity<SearchFilter>, edit: boolean;

  const submit = ({ detail: searchFilter }: CustomEvent<FullEntity<SearchFilter>>) => {
    edit = false;
    goto($searchIdPathFn(searchFilter.id));
  };

  // Ugly Safari fix :(
  let clip = false,
    innerShow = false;
  $: if (edit != innerShow) {
    clip = true;
    tick().then(() => (innerShow = edit));
  }
</script>

{#if innerShow}
  <div
    class="form"
    class:is-clipped={clip}
    on:introend={() => (clip = false)}
    transition:slide|local>
    <div class="py-3 px-3">
      <SearchFilterForm
        bind:searchFilter
        on:submit={submit}
        on:reset={() => (edit = false)}
        on:delete
        on:reset />
    </div>
  </div>
{/if}

<style lang="scss">
  .form {
    @include mq($until: tablet) {
      background-color: change-color($border, $lightness: 95%);
    }
  }
</style>
