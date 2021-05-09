<script>
  import Locale from '$components/user/settings/locale.svelte';

  import { _ } from 'svelte-i18n';
  import { generateLinkTags } from '$utils/accentTags';

  import {
    aboutPath,
    termsPath,
    forumPath,
    privacyPolicyPath,
    cookiePolicyPath,
  } from '$core/routes';

  $: links = [
    [aboutPath, $_('cmps.footer.about')],
    [forumPath, $_('cmps.footer.forum')],
    [termsPath, $_('cmps.footer.terms')],
    [privacyPolicyPath, $_('cmps.footer.privacy')],
    [cookiePolicyPath, $_('cmps.footer.cookie')],
    ['https://github.com/safeapps-io', 'github'],
  ];
</script>

<footer>
  <div class="columns">
    <ul class="column is-9">
      {#each links as [url, text]}
        <li><a href={url} target="_blank" rel="noreferrer">{text.toLocaleLowerCase()}</a></li>
      {/each}
    </ul>
    <div class="column is-3 copy">
      <p>
        {@html $_('cmps.footer.copy', {
          values: generateLinkTags('https://dkzlv.com/'),
        })}
      </p>
      <div class="mt-3 is-size-7">
        <Locale />
      </div>
    </div>
  </div>
</footer>

<style lang="scss">
  footer {
    padding-bottom: 2em;
  }

  .copy {
    // .columns is just display:block on mobile devices, so we move the copy up by
    // setting negative order when .columns is flex — on desktops
    order: -1;
  }

  ul {
    display: flex;
    align-content: flex-start;
    flex-wrap: wrap;

    li:not(:last-child):after {
      content: '·';
      padding: 0.5em;
    }
  }
</style>
