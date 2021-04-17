<script>
  import GenericTroubleshoot from '$components/elements/genericTroubleshoot.svelte';
  import PlanRedirectGuard from '$components/billing/planRedirectGuard.svelte';
  import Profile from './profile.svelte';

  import { media } from 'svelte-match-media';

  export let title: string | undefined = undefined,
    boxedView: boolean = true,
    stretchContent: boolean = false,
    nestColumnClass: string | undefined = undefined;

  export let activePlanOnly: boolean = false,
    currentUserCheck: boolean | undefined = undefined;
</script>

<!-- 
  IDEA:

  This whole mess with slots and embedding this component in each and every route was basically
  from three reasons:
  
  1. creating custom titles. Time has proved that we rarely do anything futher than just adding
     a `create` button;
  2. creating pages without the boxed background (dashboard, category list);
  3. having a form on dashboard mobile appear above the title without any margins.

  At the same time we cannot have named slots in Sapper's layout components, so if we want to have
  multiple slots (as we have here) we need to come up with such solutions.

  The problem for me is that for now as I see it we cannot create cool crossfade animations between
  pages, because this whole component is kind of recreated on each transition.
  One of the ideas is to find a way to use stores and `<svelte:component />` to eliminate the need
  of copying this component inside each route and add crossfade animations to page parts (title and
  body).
 -->

<div class="wrapper">
  <div class="is-flex">
    <!-- 
      Two different slots here.

      `title-block` for now is only used in dashboardIndex. We need it solely because we want the
      form to be marginless completely so it looks nice, BUT we do not want to force ourselves
      to add margins by hand to every other component.

      `title` is a handy slot if you want to, say, add a button after the title itself. The margins
      will stay here.
     -->
    <slot name="title-block">
      <div class="flex-full title-block">
        <slot name="title">
          {#if title}
            <h1 class="title overflow-ellipsis">{title}</h1>
          {/if}
        </slot>
      </div>
    </slot>
    {#if !$media.mobile}
      <div class="profile mr-2">
        <div class="mr-2">
          <GenericTroubleshoot right />
        </div>

        <Profile />
      </div>
    {/if}
  </div>
  {#if nestColumnClass}
    <div
      class="columns is-centered mx-2 my-3"
      class:box={boxedView && !$media.mobile}
      class:flex-full={stretchContent}>
      <div class={`column ${nestColumnClass}`}>
        <PlanRedirectGuard {currentUserCheck} runCheck={activePlanOnly}>
          <slot />
        </PlanRedirectGuard>
      </div>
    </div>
  {:else}
    <slot name="no-margin">
      <div class="mx-2 my-3" class:flex-full={stretchContent}>
        <PlanRedirectGuard {currentUserCheck} runCheck={activePlanOnly}>
          <slot />
        </PlanRedirectGuard>
      </div>
    </slot>
  {/if}
</div>

<style lang="scss">
  .title-block {
    @include mq($until: tablet) {
      margin: 1em 0.75em;
    }
    @include mq($from: tablet) {
      margin-left: 0.75em;
    }
  }

  .profile {
    display: flex;
    place-items: center;
  }

  .wrapper {
    display: flex;
    flex-direction: column;

    min-height: 100%;

    padding-bottom: var(--buttonBottomPadding);
  }
</style>
