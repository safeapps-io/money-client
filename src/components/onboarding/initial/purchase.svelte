<script>
  import type { PlanFull } from '$stores/billing';

  import screenshot from '$static/img/screenshot.png';

  import CrossfadeWrapper from '$components/elements/crossfadeWrapper.svelte';
  import Purchase from '$components/billing/purchase.svelte';
  import HoverRotation from '$components/elements/hoverRotation.svelte';

  import { locale, _ } from 'svelte-i18n';

  import { focusableShortcut } from '$utils/actions/shortcut';
  import { resize } from '$utils/actions/resize';
  import { accentTags, generateLinkTags, markTags } from '$utils/accentTags';
  import { founderEmail } from '$services/config';

  export let plan: PlanFull;

  let page: number = 0;
  // All strings are removed from lang files; you can look them up in git history
  const list = [
    $_('cmps.billing.onboarding.purchase.about.title'),
    $_('cmps.billing.onboarding.purchase.sec.title'),
    $_('cmps.billing.onboarding.purchase.paid.title'),
  ];

  let videoEl: HTMLVideoElement,
    isVideoStarted = false;
  const launchVideo = () => {
    isVideoStarted = true;
    videoEl.play();
  };

  let paddingBottom: number = 0;
</script>

<nav class="mb-6 px-5">
  <ol class="columns is-centered px-5" start="0" type="1">
    {#each list as item, i}
      <div class="column is-narrow" class:mr-6={i != list.length - 1}>
        <li
          class:active={page != i}
          on:click={() => (page = i)}
          role="button"
          tabindex="0"
          use:focusableShortcut>
          <span>{item}</span>
        </li>
      </div>
    {/each}
  </ol>
</nav>

<div class="px-5" style="padding-bottom: {paddingBottom}px">
  <CrossfadeWrapper key={page}>
    {#if page == 0}
      <div class="columns is-vcentered my-5 first-page">
        <div class="column is-6 pitch">
          <p>{$_('cmps.billing.onboarding.purchase.about.diff')}</p>
          <p>{$_('cmps.billing.onboarding.purchase.about.feat')}</p>
          <p>{$_('cmps.billing.onboarding.purchase.about.priv')}</p>
          <ul>
            <li>{$_('cmps.billing.onboarding.purchase.about.e2e')}</li>
            <li>{$_('cmps.billing.onboarding.purchase.about.trac')}</li>
            <li>{$_('cmps.billing.onboarding.purchase.about.review')}</li>
          </ul>
          <p>{$_('cmps.billing.onboarding.purchase.about.support')}</p>
        </div>
        <div class="column">
          <HoverRotation>
            <!-- svelte-ignore a11y-media-has-caption -->
            <video
              poster={screenshot}
              controls={isVideoStarted}
              width="1080"
              height="1920"
              bind:this={videoEl}>
              <source src="https://safeapps.io/static/video/demo.490d3316.mp4" type="video/mp4" />
            </video>

            {#if !isVideoStarted}
              <div class="overlay" on:click={launchVideo} />
              <!-- © https://teenyicons.com/ play-circle (solid) -->
              <svg viewBox="0 0 15 15" fill="none" width="90" height="90" on:click={launchVideo}
                ><path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M0 7.5a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0zm6.249-2.432a.5.5 0 01.5-.002l3.5 2a.5.5 0 010 .868l-3.5 2A.5.5 0 016 9.5v-4a.5.5 0 01.249-.432z"
                  fill="currentColor" /></svg>
            {/if}
          </HoverRotation>
        </div>
      </div>
    {:else if page == 1}
      <div class="columns is-centered">
        <div class="column is-7 pitch">
          <p>
            {@html $_('cmps.billing.onboarding.purchase.sec.algo', {
              values: {
                ...generateLinkTags('https://en.wikipedia.org/wiki/PBKDF2', true, 'pbk'),
                ...generateLinkTags(
                  'https://en.wikipedia.org/wiki/Advanced_Encryption_Standard',
                  true,
                  'aes',
                ),
              },
            })}
          </p>
          <p>
            {@html $_('cmps.billing.onboarding.purchase.sec.mast', { values: markTags })}
          </p>
          <p>{$_('cmps.billing.onboarding.purchase.sec.coml')}</p>
          <ul>
            <li>
              {@html $_('cmps.billing.onboarding.purchase.sec.sec', { values: markTags })}
            </li>
            <li>
              {@html $_('cmps.billing.onboarding.purchase.sec.secEncMas', { values: markTags })}
            </li>
            <li>
              {@html $_('cmps.billing.onboarding.purchase.sec.aes', {
                values: {
                  ...markTags,
                  ...generateLinkTags('https://scrambox.com/article/brute-force-aes/'),
                },
              })}
            </li>
          </ul>
          <p>{$_('cmps.billing.onboarding.purchase.sec.summary')}</p>
        </div>
      </div>
    {:else}
      <div class="columns is-centered">
        <div class="column is-7 pitch">
          <h2 class="subtitle">{$_('cmps.billing.onboarding.purchase.paid.paid')}</h2>
          <p>{$_('cmps.billing.onboarding.purchase.paid.reasons')}</p>
          <ol>
            <li>
              {@html $_('cmps.billing.onboarding.purchase.paid.nobody', { values: accentTags })}
            </li>
            <li>
              {@html $_('cmps.billing.onboarding.purchase.paid.noVc', { values: accentTags })}
            </li>
          </ol>
          <p>
            {@html $_('cmps.billing.onboarding.purchase.paid.noRisk', { values: markTags })}
          </p>
          {#if !$locale.startsWith('ru')}
            <h2 class="subtitle">{$_('cmps.billing.onboarding.purchase.paid.rubl')}</h2>
            <p>
              {$_('cmps.billing.onboarding.purchase.paid.russ')}
            </p>
            <p>
              {@html $_('cmps.billing.onboarding.purchase.paid.companies', { values: markTags })}
            </p>
            <p>
              {$_('cmps.billing.onboarding.purchase.paid.covid')}
            </p>
            <p>
              {@html $_('cmps.billing.onboarding.purchase.paid.tcs', {
                values: generateLinkTags('https://www.tinkoff.ru/eng/'),
              })}
            </p>
            <p>
              {@html $_('cmps.billing.onboarding.purchase.paid.moneyback', { values: markTags })}
            </p>
          {/if}
        </div>
      </div>
    {/if}
  </CrossfadeWrapper>
</div>

<div class="purchase" use:resize={node => (paddingBottom = node.getBoundingClientRect().height)}>
  <div class="columns is-vcentered px-6 py-3">
    <div class="column is-7">
      <Purchase {plan} />
    </div>
    <div class="column write-email">
      {@html $_('cmps.billing.onboarding.purchase.feedback', {
        values: { ...generateLinkTags(`mailto:${founderEmail}`), email: founderEmail },
      })}
    </div>
  </div>
</div>

<style lang="scss">
  nav {
    ol {
      list-style-type: decimal;
    }

    li {
      max-width: 180px;

      span {
        position: relative;
        left: -1ch;
      }

      &.active {
        color: $blue;
        cursor: pointer;

        span {
          border-bottom: 1px dotted $blue;
        }
      }

      &:focus {
        outline-offset: 5px;
      }

      &::marker {
        color: rgb(179, 179, 179);
      }
    }
  }

  .first-page {
    svg {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      transition: color 0.3s, filter 0.3s;

      color: $red;
      filter: drop-shadow(3px 3px 1px $green);
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    svg,
    .overlay {
      cursor: pointer;
    }

    video {
      border-radius: 1em;

      filter: drop-shadow(0px 0px 9px rgba(194, 194, 194, 0.5));
    }
  }

  .pitch {
    p {
      margin-bottom: 1em;
    }

    ol,
    ul {
      padding-left: 1em;
      margin-bottom: 1em;
    }

    ul {
      list-style-type: disc;
      list-style-position: inside;
    }

    :global(mark) {
      padding: 1px 3px;
      font-weight: bold;
    }
    :global(mark.red) {
      background-color: $red;
    }
    :global(mark.blue) {
      background-color: $blue;
    }
    :global(mark.green) {
      background-color: $green;
    }
  }

  .purchase {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;

    box-shadow: 0px 2px 25px 3px #dedede;
    background-color: white;

    overflow-y: scroll;
    overflow-x: hidden;
    max-height: 35vh;

    .write-email {
      text-align: right;
      @include mq($until: tablet) {
        text-align: center;
      }
    }
  }
</style>
