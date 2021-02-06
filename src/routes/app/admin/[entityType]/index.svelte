<script>
  import { stores } from '@sapper/app';

  import List from '@/components/admin/crud/list.svelte';
  import Link from '@/components/elements/link.svelte';

  import { AdminEntityPrefixes } from '@/core/admin/routes';
  import { adminEntityAddPath, adminEntityPath } from '@/core/routes';

  const { page } = stores();

  $: prefix = $page.params.entityType;
</script>

<List
  {prefix}
  header={prefix == AdminEntityPrefixes.category ? 'Meta category' : 'Scheme'}
  addLink={adminEntityAddPath(prefix)}
  let:item>
  <tr slot="head">
    {#if prefix == AdminEntityPrefixes.category}
      <th>Name</th>
      <th>Published</th>
      <th>Color</th>
      <th>Is income</th>
    {:else if prefix == AdminEntityPrefixes.scheme}
      <th>Title</th>
      <th>Encoding</th>
      <th>Published</th>
    {/if}
  </tr>

  {#if prefix == AdminEntityPrefixes.category}
    <td>
      <Link href={adminEntityPath(prefix, item.id)}>{item.name}</Link>
    </td>
    <td><input type="checkbox" checked={item.published} disabled /></td>
    <td class="color">
      <div class="swatch" style={`background-color: ${item.color}`} />
      {item.color}
    </td>
    <td><input type="checkbox" checked={item.isIncome} disabled /></td>
  {:else if prefix == AdminEntityPrefixes.scheme}
    <td>
      <Link href={adminEntityPath(prefix, item.id)}>{item.title}</Link>
    </td>
    <td>{item.encoding}</td>
    <td><input type="checkbox" checked={item.published} disabled /></td>
  {/if}
</List>

<style lang="scss">
  $swatch-size: 15px;

  .color {
    display: flex;
    place-items: center;
  }

  .swatch {
    width: $swatch-size;
    height: $swatch-size;

    border-radius: 2px;
    margin-right: 5px;
  }
</style>
