<script>
  import { setContext } from 'svelte';
  import { fade } from 'svelte/transition';

  let notifications: { id: string; text: string; type: 'danger' | 'success' | 'warning' }[] = [];

  const addNotification = (type: 'danger' | 'success' | 'warning', text: string) => {
      const id = Math.random().toString();
      notifications = [...notifications, { id, text, type }];
      setTimeout(() => removeNotification(id), 4000);
    },
    removeNotification = (idToRemove: string) =>
      (notifications = notifications.filter(({ id }) => id !== idToRemove));

  setContext('success', (text: string) => addNotification('success', text));
  setContext('danger', (text: string) => addNotification('danger', text));
  setContext('warning', (text: string) => addNotification('warning', text));
</script>

<slot />

<div class="wrapper">
  {#each notifications as { type, text, id } (id)}
    <div class="notification is-{type} is-light" transition:fade>
      <button class="delete" on:click={() => removeNotification(id)} />
      <p>{text}</p>
    </div>
  {/each}
</div>

<style lang="scss">
  .wrapper {
    position: fixed;
    bottom: 0;
    right: 0;

    width: 270px;

    @include z('notification-toast');
  }
</style>
