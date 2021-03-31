<script>
  import Troubleshoot from '$components/elements/dropdown/troubleshoot.svelte';
  import Link from '$components/elements/link.svelte';

  import { _ } from 'svelte-i18n';

  import { forumBugsPath, forumHelpPath, forumIdeasPath } from '$core/routes';
</script>

<div class="wrapper is-size-7">
  <Troubleshoot text={$_('cmps.nav.feedback.cta')} {...$$restProps}>
    <Link href={forumBugsPath} class="dropdown-item">
      <p class="has-text-danger is-size-6">
        <!-- © https://teenyicons.com/ bug -->
        <span class="icon"
          ><svg
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            ><path
              d="M4.5 4.5h6m-6 0l-.367.733A6 6 0 003.5 7.916V10.5a4 4 0 008 0V7.916a6 6 0 00-.633-2.683L10.5 4.5m-6 0v-1a3 3 0 016 0v1M0 8.5h3.5m11.5 0h-3.5M1 14l3-1.5M14 14l-3-1.5M1 3l3 1.5M14 3l-3 1.5"
              stroke="currentColor" /></svg
          ></span>
        {$_('cmps.nav.feedback.bug.title')}
      </p>
      <p>{$_('cmps.nav.feedback.bug.main')}</p>
    </Link>
    <Link href={forumHelpPath} class="dropdown-item">
      <p class="has-text-warning is-size-6">
        <!-- © https://teenyicons.com/ info -->
        <span class="icon"
          ><svg
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            ><path
              d="M7 1.5V2h1v-.5H7zm1-.01v-.5H7v.5h1zM8 13.5V4H7v9.5h1zm0-12v-.01H7v.01h1zM4 5h3.5V4H4v1zm-2 9h11v-1H2v1z"
              fill="currentColor" /></svg
          ></span>
        {$_('cmps.nav.feedback.help.title')}
      </p>
      <p>{$_('cmps.nav.feedback.help.main')}</p>
    </Link>
    <Link href={forumIdeasPath} class="dropdown-item">
      <p class="has-text-success is-size-6">
        <!-- © https://teenyicons.com/ message-plus -->
        <span class="icon"
          ><svg
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            ><path
              d="M5.5 11.493l.416-.278a.5.5 0 00-.416-.222v.5zm2 2.998l-.416.277a.5.5 0 00.832 0l-.416-.277zm2-2.998v-.5a.5.5 0 00-.416.222l.416.278zm-4.416.277l2 2.998.832-.555-2-2.998-.832.555zm2.832 2.998l2-2.998-.832-.555-2 2.998.832.555zM9.5 11.993h4v-1h-4v1zm4 0c.829 0 1.5-.67 1.5-1.5h-1c0 .277-.223.5-.5.5v1zm1.5-1.5V1.5h-1v8.994h1zM15 1.5c0-.83-.671-1.5-1.5-1.5v1c.277 0 .5.223.5.5h1zM13.5 0h-12v1h12V0zm-12 0C.671 0 0 .67 0 1.5h1c0-.277.223-.5.5-.5V0zM0 1.5v8.993h1V1.5H0zm0 8.993c0 .83.671 1.5 1.5 1.5v-1a.499.499 0 01-.5-.5H0zm1.5 1.5h4v-1h-4v1zM7 4v5h1V4H7zM5 7h5V6H5v1z"
              fill="currentColor" /></svg
          ></span>
        {$_('cmps.nav.feedback.featureReq.title')}
      </p>
      <p>{$_('cmps.nav.feedback.featureReq.main')}</p>
    </Link>
  </Troubleshoot>
</div>

<style lang="scss">
  .wrapper {
    --dropdown-min-width: 340px;

    :global(a) {
      /* Resetting bulma's behavoir */
      white-space: normal !important;
    }
  }
</style>
