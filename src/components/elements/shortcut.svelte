<script>
  import type { ShortcutSetting } from '@/utils/actions/shortcut';

  import { cmdKey, altKey, isMobile } from '@/core/platform';

  export let setting: ShortcutSetting, key: string;
  const control = cmdKey(),
    alt = altKey();
</script>

{#if !$isMobile}
  <kbd class="pl-1"
    >{#if setting.control}<kbd>{control}</kbd>+{/if}{#if setting.shift}
      <kbd>⇧</kbd>+
    {/if}{#if setting.alt}<kbd>{alt}</kbd>+{/if}<kbd>{key}</kbd></kbd>
{/if}
