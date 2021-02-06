<script>
  import Locale from '@/components/user/settings/locale.svelte';

  import { _ } from 'svelte-i18n';
  import { aboutPath, pricingPath, termsPath, howItWorksPath, forumPath } from '@/core/routes';

  $: leftLinks = [
    [aboutPath, $_('cmps.footer.about')],
    [pricingPath, $_('cmps.footer.pricing')],
    [howItWorksPath, $_('cmps.footer.howItWorks')],
    [forumPath, $_('cmps.footer.forum')],
  ];
  $: rightLinks = [
    [termsPath, $_('cmps.footer.terms')],
    ['https://github.com/safeapps-io', $_('cmps.footer.openSource')],
  ];
</script>

<footer class="columns">
  <div class="column is-9">
    <div class="columns">
      <div class="column is-4">
        {#each leftLinks as [url, text]}
          <div>
            <a href={url} target="_blank" rel="noopener">{text.toLowerCase()}</a>
          </div>
        {/each}
      </div>
      <div class="column is-4">
        <div>
          {#each rightLinks as [url, text]}
            <div>
              <a href={url} target="_blank" rel="noopener">{text.toLowerCase()}</a>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
  <div class="column is-3 copy">
    <p>
      {@html $_('cmps.footer.copy', {
        values: {
          tagO: '<a href="https://dkzlv.com/" target="_blank" rel="noopener">',
          tagC: '</a>',
        },
      })}
    </p>

    <div class="mt-3 is-size-7">
      <Locale />
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
</style>
