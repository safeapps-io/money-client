<script>
  import { createEventDispatcher } from 'svelte';

  import { Form } from '@/components/strict';
  import { adminRequest } from '@/services/request';

  const dispatch = createEventDispatcher();

  export let prefix: string,
    entId: string | undefined = undefined;

  let ent: any | undefined = undefined,
    error = false;

  $: path = `/${prefix}/${entId}`;
  $: if (entId)
    adminRequest({ path })
      .then(res => {
        if (res.json) ent = res.json;
        else error = true;
      })
      .catch(() => (error = true));

  const success = async (data: any) => {
      await adminRequest({
        path: ent ? path : '/' + prefix,
        method: ent ? 'PUT' : 'POST',
        data,
      });
      dispatch('success');
    },
    remove = async () => {
      await adminRequest({ path, method: 'DELETE' });
      dispatch('success');
    };
</script>

{#if entId}
  {#if ent}
    <Form {success}>
      <slot {ent} />

      <div slot="submit" let:disabled let:loading>
        <div class="field is-grouped">
          <div class="control">
            <button class="button" class:is-color-loading={loading} {disabled}> Update</button>
          </div>
          <div class="control">
            <button
              class="button is-text"
              class:is-color-loading={loading}
              type="button"
              {disabled}
              on:click={remove}>Delete</button>
          </div>
        </div>
      </div>
    </Form>
  {:else if error}Error!{:else}Loading!{/if}
{:else}
  <Form {success} buttonText="Create">
    <slot ent={undefined} />
  </Form>
{/if}
