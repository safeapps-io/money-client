import { derived } from 'svelte/store';

import { siteHost } from '$services/config';
import { selectedWalletStore, selectedJointWalletStore, jointWalletsStore } from '$stores/wallet';
import { getDefaultSearchFromWalletState, searchFilterStore } from '$stores/decr/searchFilter';
import { debugLog } from './logger';

export const gotoInviteFullPath = (token: string) => `${siteHost}/goto/${token}/invite`;

export const resetPasswordTokenPath = (token: string) => `/reset/${token}`;

const authRootPath = `/auth`;
export const loginPath = `${authRootPath}/login`,
  signupPath = `${authRootPath}/signup`;

export const verifyEmailPath = (token: string) => `/verify-email/${token}`,
  unsubscribePath = (token: string) => `/unsubscribe/${token}`;

export const appPath = '/app';

const userPath = `${appPath}/user`;
export const userSettingsPath = `${userPath}/general`,
  userSecurityPath = `${userPath}/security`,
  userBillingPath = `${userPath}/billing`;

/**
 * They are not exported because they are not intended to be used outside of this module.
 * Users should never land on `rootCurrentWalletPath`, because there's nothing there.
 */
const rootWalletPathFn = (walletId: string) => `${appPath}/${walletId}`,
  rootCurrentWalletPath = derived(
    [selectedWalletStore, selectedJointWalletStore],
    ([wallet, jointWallet]) => rootWalletPathFn(wallet || jointWallet || ''),
  );

export const rootWalletPath = derived(
    searchFilterStore,
    $searchFiltersByWallet => (walletId: string) => {
      const defaultSearchFilterId = getDefaultSearchFromWalletState(
        $searchFiltersByWallet[walletId] || {},
      )?.id;
      if (!defaultSearchFilterId) {
        debugLog('[routes] no default search', {
          walletId,
          options: Object.keys($searchFiltersByWallet),
          forWallet: Object.keys($searchFiltersByWallet[walletId] || {}),
        });
        return appPath;
      }

      return `${rootWalletPathFn(walletId)}/${defaultSearchFilterId}`;
    },
  ),
  rootJointWalletPath = derived(
    [searchFilterStore, jointWalletsStore],
    ([$searchFiltersByWallet, $jointWallets]) => (jointWalletId: string) => {
      const jointWallet = $jointWallets?.[jointWalletId],
        defaultSearchFilterId =
          getDefaultSearchFromWalletState(
            $searchFiltersByWallet[jointWallet?.walletIds[0] || ''] || {},
          )?.id || '';

      return `${rootWalletPathFn(jointWalletId)}/${defaultSearchFilterId}`;
    },
  ),
  walletGeneralSettingsPath = derived(rootCurrentWalletPath, root => `${root}/settings/general`),
  walletUsersSettingsPath = derived(rootCurrentWalletPath, root => `${root}/settings/users`);

export const searchIdPathFn = derived(rootCurrentWalletPath, root => (id: string) =>
  `${root}/${id}`,
);

export const categoryListPath = derived(rootCurrentWalletPath, root => `${root}/category`),
  addCategoryPath = derived(rootCurrentWalletPath, root => `${root}/category/add`),
  categoryPathFn = derived(rootCurrentWalletPath, root => (id: string) => `${root}/category/${id}`);

export const transactionDraftsPath = derived(
    rootCurrentWalletPath,
    root => `${root}/transaction/drafts`,
  ),
  importPath = derived(rootCurrentWalletPath, root => `${root}/transaction/import`),
  addTransactionPath = derived(rootCurrentWalletPath, root => `${root}/transaction/add`),
  transactionPathFn = derived(rootCurrentWalletPath, root => (id: string) =>
    `${root}/transaction/${id}`,
  ),
  transactionCorrectionPathFn = derived(rootCurrentWalletPath, root => (id: string) =>
    `${root}/transaction/correction/${id}`,
  );

// Root Site --------------
const content = 'https://safeapps.io/content';
export const aboutPath = `${content}/about`,
  termsPath = `${content}/terms`,
  privacyPolicyPath = `${content}/privacy`;

export const forumPath = 'https://forum.safeapps.io',
  forumHelpPath = `${forumPath}/c/help/6`,
  forumBugsPath = `${forumPath}/c/bugs/5`,
  forumIdeasPath = `${forumPath}/c/ideas/7`,
  forumBankHelpPath = `${forumPath}/c/support-for-banks/8`;
