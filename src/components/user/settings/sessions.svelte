<script>
  import type { RefreshToken } from '$stores/user';

  import LoadingBlock from '$components/elements/loadingBlock.svelte';

  import { _ } from 'svelte-i18n';

  import { AuthService } from '$services/auth/authService';

  let sessions: RefreshToken[] = [];

  let loading = false;
  const click = async (dropId?: string) => {
    loading = true;
    sessions = await AuthService.dropSessions(dropId);
    loading = false;
  };
</script>

<LoadingBlock fetchData={() => AuthService.getSessions().then(res => (sessions = res))}>
  {#each sessions as session (session.id)}
    <div class="is-flex mb-4">
      <div class="flex-full">
        <p>
          {session.description}
          {#if session.current}<span class="is-italic has-text-grey"
              >({$_('cmps.user.session.current').toLowerCase()})</span
            >{/if}
        </p>
        <p class="is-size-7 has-text-grey">
          {$_('cmps.user.session.created', { values: { date: session.created } })}
        </p>
      </div>
      {#if !session.current}
        <button
          class="button is-small is-danger is-outlined"
          disabled={loading}
          on:click={() => click(session.id)}>{$_('common.form.close')}</button>
      {/if}
    </div>
  {/each}

  {#if sessions.length > 1}
    <button class="button is-small mt-5" disabled={loading} on:click={() => click()}
      >{$_('cmps.user.session.close')}</button>

    <p class="help">{$_('cmps.user.session.5min')}</p>
  {/if}
</LoadingBlock>
