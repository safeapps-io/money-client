<script>
  import UnAuthLayout from '$components/nav/unAuthLayout.svelte';

  import { onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { _ } from 'svelte-i18n';
  import { goto } from '$app/navigation';

  import { appPath } from '$core/routes';
  import { generateLinkTags } from '$utils/accentTags';

  const iconSize = 45,
    supportEmail = 'hey@safeapps.io',
    isSuccess = $page.query.get('status') == 'ok';

  $: title = isSuccess ? $_('routes.pay.ok.title') : $_('routes.pay.notOk.title');
  $: description = isSuccess
    ? $_('routes.pay.ok.redirect')
    : $_('routes.pay.notOk.support', {
        values: { email: supportEmail, ...generateLinkTags(`mailto:${supportEmail}`, true) },
      });

  let timer: number;
  if (isSuccess) timer = setTimeout(() => goto(appPath), 5000);
  onDestroy(() => clearTimeout(timer));
</script>

<UnAuthLayout>
  <div class="wrapper">
    <p class="is-size-3">
      {#if isSuccess}<svg
          class="has-text-success"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          height={iconSize}
          ><path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M0 7.5a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0zm7.072 3.21l4.318-5.398-.78-.624-3.682 4.601L4.32 7.116l-.64.768 3.392 2.827z"
            fill="currentColor" /></svg
        >{:else}
        <svg
          class="has-text-danger"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          height={iconSize}
          ><path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M0 7.5a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0zm10.146 3.354L7.5 8.207l-2.646 2.647-.708-.707L6.793 7.5 4.146 4.854l.708-.708L7.5 6.793l2.646-2.647.708.708L8.207 7.5l2.647 2.646-.707.708z"
            fill="currentColor" /></svg
        >{/if}
    </p>
    <h1 class="subtitle">{title}</h1>
    <p>{@html description}</p>
    <a href={appPath} class="button is-success is-outlined mt-5">{$_('routes.pay.goto')}</a>
  </div>
</UnAuthLayout>

<style lang="scss">
  .wrapper {
    text-align: center;
  }
</style>
