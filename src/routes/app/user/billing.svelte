<script>
  import Page from '$components/nav/page.svelte';
  import Plan from '$components/billing/plan.svelte';

  import { _ } from 'svelte-i18n';
</script>

<Page title={$_('routes.user.billing')} nestColumnClass="is-8">
  <h2 class="title">{$_('routes.user.plan')}</h2>
  <Plan />
</Page>
