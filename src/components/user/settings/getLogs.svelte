<script>
  import CopyText from '@/components/elements/copyText.svelte';

  import { _ } from 'svelte-i18n';

  import { getLogData } from '@/core/logger';
  import { userEncrStore } from '@/stores/user';

  const logData = getLogData();

  $: text = logData.length
    ? JSON.stringify({ userId: $userEncrStore!.id, logData })
    : $_('cmps.user.logs.noLogs');
</script>

<p class="label">{$_('cmps.user.logs.label')}</p>
<CopyText {text} />
<p class="help">{$_('cmps.user.logs.help')}</p>
