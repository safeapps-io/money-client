<script>
  import Shortcut from './shortcut.svelte';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher, getContext } from 'svelte';

  import { shortcut } from '$utils/actions/shortcut';

  import { deletedAdd } from '$stores/decr/deleted';
  import { userEncrStore } from '$stores/user';

  const successNotif = getContext('success'),
    dangerNotif = getContext('danger'),
    dispatch = createEventDispatcher();

  export let entityMap: { [walletId: string]: string[] },
    runBefore: (() => Promise<boolean>) | undefined = undefined,
    buttonText: string | undefined = $_('cmps.deleteEntity.delete');

  const shortcutSetting = { shift: true, code: 'Backspace' };

  const click = async () => {
    try {
      if (runBefore) {
        const goFurther = await runBefore();
        if (!goFurther) return;
      } else if (
        !window.confirm(
          $_('cmps.deleteEntity.confirmation') + ' ' + $_('cmps.deleteEntity.irreversible'),
        )
      )
        return;

      dispatch('delete');

      await Promise.all(
        Object.entries(entityMap).map(([walletId, ids]) =>
          deletedAdd(walletId, { ids, remoteDeleted: false, initiatorId: $userEncrStore!.id }),
        ),
      );
      successNotif($_('cmps.deleteEntity.success'));
    } catch (error) {
      dangerNotif($_('cmps.deleteEntity.error'));
    }
  };
</script>

<slot {click} {buttonText}>
  <button
    class="button is-danger is-outlined"
    on:click={click}
    type="button"
    use:shortcut={shortcutSetting}
    >{buttonText} <Shortcut setting={shortcutSetting} key={shortcutSetting.code} /></button>
</slot>
