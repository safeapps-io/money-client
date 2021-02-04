<script>
  import cssVars from 'svelte-css-vars';
  import loaderIcon from 'teenyicons/outline/loader.svg';

  export let height: number | undefined = undefined;

  $: loaderHeight = height ? `${height}px` : 'auto';
</script>

<style>
  div {
    display: flex;
    flex-direction: column;
    place-content: center;
    place-items: center;

    height: var(--loaderHeight);
  }

  @keyframes loading-svg {
    0% {
      transform: rotate();
    }
    50% {
      transform: rotate(180deg);
    }
    100% {
      transform: rotate();
    }
  }

  img {
    animation: loading-svg 2s infinite;
  }
</style>

<div use:cssVars={{ loaderHeight }}>
  <img src={loaderIcon} alt="loader" width="25" height="25" />
</div>
