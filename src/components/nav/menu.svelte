<script>
  import Link from '@/components/elements/link.svelte';
  import Logout from '@/components/user/logout.svelte';
  import TransactionAdd from '@/components/transaction/add.svelte';
  import CurrentWalletDropdown from '@/components/wallet/currentWalletDropdown.svelte';

  import { _ } from 'svelte-i18n';
  import { slide } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { media } from 'svelte-match-media';

  import {
    transactionDraftsPath,
    searchIdPathFn,
    categoryListPath,
    walletGeneralSettingsPath,
    walletUsersSettingsPath,
    userSettingsPath,
    userSecurityPath,
    adminEntityListPath,
    adminSettingsPath,
  } from '@/core/routes';

  import { selectedWalletStore } from '@/stores/wallet';
  import { searchFilterSortedByTitleStore } from '@/stores/decr/searchFilter';
  import { userEncrStore } from '@/stores/user';
  import { draftTransactionStore } from '@/stores/decr/transaction';
  import { AdminEntityPrefixes } from '@/core/admin/routes';

  export let showMenu = true;

  $: username = $userEncrStore?.username || '';
  $: isAdmin = $userEncrStore?.isAdmin;

  const addActiveClass = 'is-active';
</script>

<aside class="menu">
  <CurrentWalletDropdown />

  <hr class="menu-delimiter" />

  <div class="my-5">
    <TransactionAdd shouldShowOnboarding={showMenu} />
  </div>

  {#if $draftTransactionStore.length}
    <p class="menu-label">{$_('cmps.transaction.common.transactions')}</p>
    <ul class="menu-list">
      <li>
        <Link href={$transactionDraftsPath} {addActiveClass} class="has-text-weight-bold">
          <span>{$_('cmps.nav.menu.drafts')}</span>
          <span class="tag is-warning is-light">{$draftTransactionStore.length}</span>
        </Link>
      </li>
      <li>
        <p class="py-2 px-3">{$_('cmps.nav.menu.filters')}</p>
        <ul>
          {#each $searchFilterSortedByTitleStore as { id, decr } (id)}
            <li animate:flip={{ duration: 300 }}>
              <Link href={$searchIdPathFn(id)} {addActiveClass}>
                {decr.protected ? $_('cmps.searchFilter.allTransactions') : decr.name}
              </Link>
            </li>
          {/each}
        </ul>
      </li>
    </ul>
  {:else}
    <p class="menu-label">{$_('cmps.nav.menu.filters')}</p>
    <ul class="menu-list">
      {#each $searchFilterSortedByTitleStore as { id, decr } (id)}
        <li animate:flip={{ duration: 300 }}>
          <Link href={$searchIdPathFn(id)} {addActiveClass}>
            {decr.protected ? $_('cmps.searchFilter.allTransactions') : decr.name}
          </Link>
        </li>
      {/each}
    </ul>
  {/if}

  <p class="menu-label">{$_('cmps.wallet.common.wallet')}</p>
  <ul class="menu-list">
    <li>
      <Link href={$categoryListPath} {addActiveClass}>{$_('cmps.category.common.categories')}</Link>
    </li>
    {#if $selectedWalletStore}
      <li transition:slide|local>
        <Link href={$walletUsersSettingsPath} {addActiveClass}>{$_('cmps.nav.menu.users')}</Link>
      </li>
    {/if}
    <li>
      <Link href={$walletGeneralSettingsPath} {addActiveClass}>{$_('cmps.nav.menu.settings')}</Link>
    </li>
  </ul>
  {#if $media.mobile}
    <hr class="menu-delimiter" />
    <p class="menu-label">{username}</p>
    <ul class="menu-list">
      <li>
        <Link href={userSettingsPath} {addActiveClass}>{$_('cmps.nav.menu.settings')}</Link>
      </li>

      <li>
        <Link href={userSecurityPath} {addActiveClass}>{$_('cmps.nav.menu.security')}</Link>
      </li>
      <li class="mt-4">
        <Logout class="has-text-danger" />
      </li>
    </ul>
    <hr class="menu-delimiter" />
    <p class="menu-label is-size-7">Version: {process.env.VERSION}</p>
  {/if}

  {#if isAdmin}
    <hr class="menu-delimiter mt-5" />
    <p class="menu-label">Admin</p>
    <ul class="menu-list">
      <li>
        <Link href={adminSettingsPath} {addActiveClass}>Settings</Link>
      </li>

      <li>
        <Link href={adminEntityListPath(AdminEntityPrefixes.category)} {addActiveClass}>
          Meta Categories
        </Link>
      </li>

      <li>
        <Link href={adminEntityListPath(AdminEntityPrefixes.scheme)} {addActiveClass}>Schemes</Link>
      </li>
    </ul>
  {/if}
</aside>
