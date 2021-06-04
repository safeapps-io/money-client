<script>
  import CrossfadeWrapper from '$components/elements/crossfadeWrapper.svelte';
  import UnAuthLayout from '$components/nav/unAuthLayout.svelte';
  import Cookie from '$components/auth/cookie.svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { userEncrStore } from '$stores/user';
  import { appPath, loginPath, signupPath } from '$core/routes';

  onMount(() => {
    if ($userEncrStore) goto(appPath, { replaceState: true });
    else show = true;
  });

  let show = false,
    reactiveSearch = '';
  $: if ($page.query) reactiveSearch = window.location.search;
</script>

{#if show}
  <UnAuthLayout>
    <h2 class="title is-4">
      {#if $page.path.includes('signup')}
        {$_('cmps.user.signup.cta')}
      {:else}<a href={signupPath + reactiveSearch}>{$_('cmps.user.signup.cta')}</a>{/if}
      <span class="delimiter" />
      {#if $page.path.includes('login')}
        {$_('cmps.user.signIn')}
      {:else}<a href={loginPath + reactiveSearch}>{$_('cmps.user.signIn')}</a>{/if}
    </h2>

    <CrossfadeWrapper key={$page.path}>
      <div class="py-1 px-1">
        <slot />
      </div>
    </CrossfadeWrapper>
  </UnAuthLayout>

  <Cookie />
{/if}

<style>
  h2 {
    align-self: center;
  }

  .delimiter::after {
    content: '|';
    font-weight: normal;
    padding: 0 0.4em;
  }
</style>
