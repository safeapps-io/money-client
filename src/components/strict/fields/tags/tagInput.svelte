<script>
  import { createEventDispatcher } from 'svelte';

  export let id: string, inputValue: string, placeholder: string | undefined;

  let ref: HTMLInputElement;

  const dispatch = createEventDispatcher(),
    onFocus = () => dispatch('focus'),
    onBlur = () => dispatch('blur'),
    onInput: svelte.JSX.EventHandler<KeyboardEvent, HTMLInputElement> = e => {
      switch (e.key) {
        case 'Escape':
          ref.blur();
          break;

        case 'Enter':
          e.preventDefault();
          dispatch('enter');
          break;

        case 'Backspace':
          if (!inputValue) dispatch('backspace');
          break;

        case 'ArrowUp':
        case 'ArrowDown':
          e.preventDefault();
          dispatch(e.key == 'ArrowUp' ? 'up' : 'down');
          break;
      }
    };
</script>

<style lang="scss">
  input {
    width: 100% !important;
    margin-bottom: 0.1em !important;
    margin-top: 0.1em !important;

    border: none;
    outline: none;
  }
</style>

<input
  {id}
  {placeholder}
  bind:this={ref}
  bind:value={inputValue}
  on:keydown={onInput}
  on:change={onInput}
  on:blur={onBlur}
  on:focus={onFocus} />
