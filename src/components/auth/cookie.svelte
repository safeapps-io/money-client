<script>
  import brutePic from '$static/img/brute.jpg';

  import { fly } from 'svelte/transition';
  import { _ } from 'svelte-i18n';

  import { generateLinkTags } from '$utils/accentTags';

  import { cookiePolicyPath } from '$core/routes';
  import { hasClosedBanner, setClosedBanner } from '$services/auth/cookieBanner';

  let show = !hasClosedBanner();
  const close = () => {
    setClosedBanner();
    show = false;
  };
</script>

{#if show}
  <div class="banner" in:fly={{ y: 100, delay: 1000 }} out:fly|local={{ y: 100 }}>
    <div class="brute" style="--bg-url: url({brutePic})" />

    <div class="text is-size-7">
      <p>
        <span class="is-size-6 has-text-weight-bold is-italic">{$_('cmps.cookies.brute')}</span>
        {$_('cmps.cookies.yeah')}
      </p>
      <p>
        {@html $_('cmps.cookies.text', { values: generateLinkTags(cookiePolicyPath) })}
      </p>
      <button on:click={close}>{$_('common.form.close')}</button>
    </div>
  </div>
{/if}

<style lang="scss">
  $radius: 0.5em;

  .banner {
    position: fixed;
    bottom: 1em;
    right: 1em;
    @include mq($until: tablet) {
      left: 1em;
    }
    @include mq($from: tablet) {
      width: 450px;
    }

    display: flex;
    background-color: white;
    box-shadow: 0 3.3px 3.3px -15px rgba(0, 0, 0, 0.075), 0 26px 26px -15px rgba(0, 0, 0, 0.12);

    border-radius: $radius;
    border: 1px hsla(0, 0%, 85%, 0.5) solid;
  }

  .brute {
    @include mq($until: tablet) {
      min-width: 100px;
    }
    @include mq($from: tablet) {
      min-width: 150px;
    }
    background: var(--bg-url) no-repeat 100% 50%;
    background-size: cover;

    border-radius: $radius 0 0 $radius;
  }

  $padd: 1.5em;
  .text {
    position: relative;
    padding: $padd;

    button {
      position: absolute;
      top: 0;
      right: 0;
      appearance: none;
      background: none;
      border: none;
      $butt-padd: 0.9em;
      padding: $butt-padd;

      transform: translate($butt-padd, -($padd + $butt-padd));
      cursor: pointer;
      color: gray;

      text-decoration: underline dotted;
      text-transform: lowercase;
      text-shadow: 1px 1px 1px white, -1px -1px 1px white;
    }
  }
</style>
