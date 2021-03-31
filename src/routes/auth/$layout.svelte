<script>
  import Logo from '$components/nav/logo.svelte';
  import Link from '$components/elements/link.svelte';
  import CrossfadeWrapper from '$components/elements/crossfadeWrapper.svelte';
  import Footer from '$components/nav/footer.svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { scale, fade } from 'svelte/transition';
  import { _ } from 'svelte-i18n';
  import { quintOut } from 'svelte/easing';

  import { userEncrStore } from '$stores/user';
  import { appPath, loginPath, signupPath } from '$core/routes';

  onMount(() => {
    if ($userEncrStore) goto(appPath, { replaceState: true });
    else show = true;
  });

  let show = false;
  $: queryParams = Object.keys($page.params).length ? window.location.search : '';
</script>

<div class="wrapper">
  {#if show}
    <main in:scale={{ duration: 1000, delay: 500, opacity: 0, easing: quintOut }}>
      <Logo />
      <hr />
      <h2 class="title is-4">
        {#if $page.path.includes('signup')}
          {$_('cmps.user.signup.cta')}
        {:else}<Link href={signupPath + queryParams}>{$_('cmps.user.signup.cta')}</Link>{/if}
        <span class="px-2 is-unselectable">|</span>
        {#if $page.path.includes('login')}
          {$_('cmps.user.signIn')}
        {:else}<Link href={loginPath + queryParams}>{$_('cmps.user.signIn')}</Link>{/if}
      </h2>

      <CrossfadeWrapper replayAnimationKey={$page.path}>
        <div class="py-1 px-1">
          <slot />
        </div>
      </CrossfadeWrapper>
    </main>

    <div class="mt-5" in:fade>
      <Footer />
    </div>
  {/if}
</div>

<style lang="scss">
  .wrapper {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;

    min-height: 100vh;
    @include mq($until: tablet) {
      width: 95%;
    }
    @include mq($from: tablet) {
      width: 50%;
    }
    margin: 0 auto;
  }

  main {
    display: flex;
    flex-direction: column;
    place-content: center;

    @include mq($from: desktop) {
      width: 400px;
      margin: 0 auto;
    }
  }
</style>
