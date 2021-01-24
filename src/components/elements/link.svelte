<script lang="typescript">
  import { stores } from '@sapper/app';

  export let href: string,
    targetBlank = false as boolean,
    nofollow = false as boolean,
    prefetch = true as boolean;

  $: externalUrl = href.indexOf('://') !== -1;

  // If set to true via props, then always blank; otherwise true by default for external links and false for internal
  $: target = targetBlank || externalUrl ? '_blank' : '';

  let rel = '';
  $: {
    if (externalUrl) {
      rel = 'noopener noreferrer';
    } else if (prefetch) {
      rel = 'prefetch';
    }
    if (nofollow) rel += ' nofollow';
  }

  export let addActiveClass: string | undefined = undefined;
  let ref: HTMLAnchorElement;
  const { page } = stores();
  $: if (ref && addActiveClass) {
    if ($page.path.startsWith(href)) ref.classList.add(addActiveClass);
    else ref.classList.remove(addActiveClass);
  }
</script>

<a {...$$restProps} {href} {rel} {target} bind:this={ref}>
  <slot />
</a>
