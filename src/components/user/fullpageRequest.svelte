<script>
  import FullpageLoader from '$components/elements/fullpageLoader.svelte';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher, getContext, onMount } from 'svelte';

  const successNotif = getContext('success'),
    dangerNotif = getContext('success'),
    dispatch = createEventDispatcher();

  export let req: () => Promise<any>, successMessage: string, errorMessage: string;

  onMount(async () => {
    try {
      await req();
      successNotif(successMessage);
      dispatch('success');
    } catch (error) {
      dangerNotif(errorMessage);
      dispatch('fail');
    }
  });
</script>

<FullpageLoader />
