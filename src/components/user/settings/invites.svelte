<script>
  import CopyText from '@/components/elements/copyText.svelte';

  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { InviteService } from '@/services/invite/inviteService';
  import { userEncrStore } from '@/stores/user';

  // Setting empty string as first item to prevent flashes
  let inviteLink: string = '';

  onMount(async () => (inviteLink = await InviteService.generateServiceInvite($userEncrStore!.id)));
</script>

<p class="mt-5">{$_('cmps.user.invites.send')}</p>
<CopyText text={inviteLink} />
<p class="help">{$_('cmps.user.invites.help')}</p>
