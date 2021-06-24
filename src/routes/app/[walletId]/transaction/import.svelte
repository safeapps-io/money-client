<script>
  import Page from '$components/nav/page.svelte';
  import MainCsv from '$components/import/main.svelte';

  import { _ } from 'svelte-i18n';
  import { media } from 'svelte-match-media';
  import { goto } from '$app/navigation';

  import { appPath } from '$core/routes';
</script>

<Page title={$_('routes.wallet.import')} nestColumnClass="is-12" stretchContent={$media.mobile}>
  <MainCsv on:success={() => goto(appPath)} />
</Page>
