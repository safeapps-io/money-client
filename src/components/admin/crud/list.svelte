<script>
  import { adminRequest } from '$services/request';

  export let prefix: string, header: string, addLink: string;

  $: getItems = () => adminRequest<any[]>({ path: `/${prefix}` });
</script>

<div class="is-flex">
  <h1 class="title">{header}</h1>
  <a class="button is-success is-light ml-3" href={addLink}>Add new</a>
</div>

<table class="table is-fullwidth">
  {#await getItems()}
    <tbody>
      <tr>
        <td class="loading">Loading...</td>
      </tr>
    </tbody>
  {:then res}
    {#if res.json.length}
      <thead>
        <slot name="head" />
      </thead>
    {/if}
    <tbody class="body">
      {#each res.json as item}
        <tr>
          <slot {item} />
        </tr>
      {:else}
        <tr>
          <td class="loading">No data yet</td>
        </tr>
      {/each}
    </tbody>
  {:catch}
    <tbody>
      <tr>
        <td class="loading">Loading...</td>
      </tr>
    </tbody>
  {/await}
</table>

<style lang="scss">
  .loading {
    width: 100%;

    text-align: center;
    padding: 3em 0;
  }
</style>
