<script>
  import Logo from '@/components/nav/logo.svelte';
  import Link from '@/components/elements/link.svelte';

  import { goto, stores } from '@sapper/app';
  import { onMount } from 'svelte';
  import { scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  import { tokenStore } from '@/stores/token';
  import { appPath, loginPath, signupPath } from '@/core/routes';

  export let segment: string;

  const { page } = stores();

  onMount(() => {
    const token = $tokenStore;

    if (token && token.accessToken) goto(appPath);
    else show = true;
  });

  let show = false;
  $: queryParams = $page.query ? window.location.search : '';
</script>

{#if show}
  <div
    class="columns is-centered mt-6 px-2 py-2"
    in:scale={{ duration: 1000, delay: 500, opacity: 0, easing: quintOut }}>
    <div class="column is-6">
      <Logo />
      <hr />
      <div class="columns is-centered">
        <div class="column is-8">
          <h2 class="title is-4">
            {#if segment != 'signup'}
              <Link href={signupPath + queryParams}>Sign up</Link>
            {:else}Sign up{/if}
            <span class="px-2 is-unselectable">|</span>
            {#if segment != 'login'}
              <Link href={loginPath + queryParams}>Sign in</Link>
            {:else}Sign in{/if}
          </h2>

          <slot />
        </div>
      </div>
    </div>
  </div>
{/if}
