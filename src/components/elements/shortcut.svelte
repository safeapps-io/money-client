<script>
  import { cmdKey, altKey, isMobile, backspaceKey } from '@/core/platform';
  import type { ShortcutSetting } from '@/utils/actions/shortcut';

  export let setting: ShortcutSetting, key: string;

  const alt = altKey(),
    control = cmdKey(),
    backspace = backspaceKey();
</script>

{#if !$isMobile}
  <kbd class="pl-1"
    >{#if setting.control}<kbd>{control}</kbd>+{/if}{#if setting.shift}
      <kbd>⇧</kbd>+{/if}{#if setting.alt}<kbd>{alt}</kbd>+{/if}<kbd
      >{#if key == 'Backspace'}{backspace}{:else}{key}{/if}</kbd
    ></kbd>
{/if}
