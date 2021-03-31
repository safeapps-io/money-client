<script>
  import CopyText from '$components/elements/copyText.svelte';

  import { _ } from 'svelte-i18n';
  import { browser } from '$app/env';

  import { getLogData } from '$core/logger';
  import { userEncrStore } from '$stores/user';

  const logData = getLogData(),
    text = JSON.stringify({
      userId: $userEncrStore!.id,
      version: process.env.VERSION,
      ua: browser && navigator.userAgent,
      logData,
    });
</script>

<p class="label">{$_('cmps.user.logs.label')}</p>
<CopyText {text} />
<p class="help">{$_('cmps.user.logs.help')}</p>
