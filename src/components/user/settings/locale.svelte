<script>
  import { locale, _ } from 'svelte-i18n';

  const choices = [
      { label: 'English', value: 'en' },
      { label: 'Русский', value: 'ru' },
    ],
    id = Math.random().toString();
</script>

<div class="field">
  <label class="label" for={id}>{$_('cmps.user.language')}</label>
  <div class="select">
    <select {id} bind:value={$locale}>
      {#each choices as { label, value } (value)}
        <option {value}>{label}</option>
      {/each}
    </select>
  </div>
</div>
