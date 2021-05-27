<script>
  import { dev } from '$app/env';

  export let status: number;
  export let error: Error;
</script>

<svelte:head>
  <title>Oops: {status}</title>
</svelte:head>

<h1>{status}</h1>

<p>{error.message}</p>

{#if dev && error.stack}
  <pre>{error.stack}</pre>
{/if}
