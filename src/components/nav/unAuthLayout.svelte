<script>
  import Logo from '$components/nav/logo.svelte';
  import Footer from '$components/nav/footer.svelte';

  import { scale, fade } from 'svelte/transition';
  import { _ } from 'svelte-i18n';
  import { quintOut } from 'svelte/easing';
</script>

<div class="wrapper">
  <main in:scale={{ duration: 1000, delay: 500, opacity: 0, easing: quintOut }}>
    <Logo />
    <hr />
    <slot />
  </main>

  <div class="mt-5" in:fade>
    <Footer />
  </div>
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
    $margin: 3em;

    display: flex;
    flex-direction: column;
    place-content: center;

    @include mq($from: desktop) {
      width: 400px;
      margin: $margin auto;
    }
    @include mq($until: desktop) {
      margin-top: $margin;
      margin-bottom: $margin * 2;
    }
  }
</style>
