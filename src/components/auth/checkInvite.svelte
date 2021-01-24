<script>
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';

  import { AuthService, InvitePurpose } from '@/services/auth/authService';

  const dispatch = createEventDispatcher();

  export let rawInvite: string | undefined;

  const enum InviteServiceFormErrors {
    noInvite = 'n',

    limitReached = 'limitReached',
    cannotUsePrelaunchInvites = 'cannotUsePrelaunchInvites',
    inviteAlreadyUsed = 'inviteAlreadyUsed',
  }

  let invite: string | undefined = undefined,
    loading = true,
    inviteError: InviteServiceFormErrors | undefined = undefined;

  const runValidation = async (inviteToValidate?: string) => {
    try {
      if (!inviteToValidate) throw new Error();

      const atobInvite = atob(inviteToValidate);

      inviteError = undefined;
      await AuthService.isInviteValid(atobInvite, InvitePurpose.signup);
      dispatch('success', atobInvite);
      invite = atobInvite;
    } catch (error) {
      inviteError = inviteToValidate ? error?.errors?.message : InviteServiceFormErrors.noInvite;
      dispatch('fail');
    } finally {
      loading = false;
    }
  };

  $: runValidation(rawInvite);
</script>

{#if !loading && !invite && inviteError}
  <div class="message is-warning" in:slide>
    <div class="message-body">
      <p class="has-text-weight-bold">
        {#if inviteError == InviteServiceFormErrors.noInvite}
          Нет приглашения
        {:else if inviteError == InviteServiceFormErrors.limitReached}
          У приглашающего исчерпан лимит приглашений
        {:else if inviteError == InviteServiceFormErrors.cannotUsePrelaunchInvites}
          Нельзя использовать приглашение для предзапуска
        {:else if inviteError == InviteServiceFormErrors.inviteAlreadyUsed}
          Приглашение уже было использовано
        {:else}Невалидное приглашение{/if}
      </p>
      <p>
        Мы делаем самый простой, безопасный и функциональный способ управлять финансами. Скоро он
        будет доступен всем, но пока что эта тусовка только
        <span class="is-italic">по приглашениям.</span>
      </p>
    </div>
  </div>
{/if}
