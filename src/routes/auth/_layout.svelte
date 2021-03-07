<script>
  import Logo from '@/components/nav/logo.svelte';
  import Link from '@/components/elements/link.svelte';
  import CrossfadeWrapper from '@/components/elements/crossfadeWrapper.svelte';
  import Footer from '@/components/nav/footer.svelte';

  import { goto, stores } from '@sapper/app';
  import { onMount } from 'svelte';
  import { scale, fade } from 'svelte/transition';
  import { _ } from 'svelte-i18n';
  import { quintOut } from 'svelte/easing';

  import { userEncrStore } from '@/stores/user';
  import { appPath, loginPath, signupPath } from '@/core/routes';

  export let segment: string;

  const { page } = stores();

  onMount(() => {
    if ($userEncrStore) goto(appPath, { replaceState: true });
    else show = true;
  });

  let show = false;
  $: queryParams = $page.query ? window.location.search : '';
</script>

<div class="wrapper">
  {#if show}
    <main in:scale={{ duration: 1000, delay: 500, opacity: 0, easing: quintOut }}>
      <Logo />
      <hr />
      <h2 class="title is-4">
        {#if segment != 'login'}
          <Link href={loginPath + queryParams}>{$_('cmps.user.signIn')}</Link>
        {:else}{$_('cmps.user.signIn')}{/if}
        <span class="px-2 is-unselectable">|</span>
        {#if segment != 'signup'}
          <Link href={signupPath + queryParams}>{$_('cmps.user.signup.cta')}</Link>
        {:else}{$_('cmps.user.signup.cta')}{/if}
      </h2>

      <CrossfadeWrapper replayAnimationKey={segment}>
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
