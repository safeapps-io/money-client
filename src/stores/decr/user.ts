import { nanoid } from 'nanoid';
import { derived, get } from 'svelte/store';
import { encode } from 'base64-arraybuffer-es6';

import { copy } from '$utils/object';

import type { UserEncrState } from '$stores/user';
import { userEncrStore } from '$stores/user';
import { encryptionKeysStateStore } from '$stores/encr/keysState';
import type { AutomationSettings, BaseSimpleScheme } from '$core/import/types';
import type { JointWallet } from './types';
import { decrypt, encrypt } from '$services/crypto/keys';

export type OnboardingSteps =
  | 'firstWallet'
  | 'howToAdd'
  | 'fileImport'
  | 'setScheme'
  | 'csvQueue'
  | 'balance'
  | 'pinCode';
type UserDecrPart = {
  jointWallets?: { [id: string]: JointWallet };
  settings?: {
    automation?: AutomationSettings;
    onboarding?: Partial<{ [key in OnboardingSteps]: true }>;

    // These are defined in Wizard.svelte in onboarding folder
    // Holds ids of problems. Possibly we'll move them to DB later
    userProblems?: number[];
  };
  schemes?: BaseSimpleScheme[];
};

const defaultDecrState: UserDecrPart = {
  jointWallets: {},
  settings: {},
  schemes: [],
};

export const userDecrStore = derived(
  [userEncrStore, encryptionKeysStateStore],
  ([$user, $keysState], set) => {
    if (!$user || !$user.b64salt || !$keysState.encryptionKeySet) return set(null);

    const { encr, ...restUser } = $user;
    if (!encr) return set({ ...restUser, decr: copy(defaultDecrState) });

    decrypt<UserDecrPart>(encr, $user.id, $user.b64salt).then(res =>
      set({ ...restUser, decr: res }),
    );
  },
  null as
    | (Omit<UserEncrState, 'encr'> & {
        decr: UserDecrPart;
      })
    | null,
);
export const automationSettingsStore = derived(
  userDecrStore,
  $user =>
    $user?.decr.settings?.automation || {
      disableAutomation: false,
      automationPower: 0.6,
    },
);

const getStoreValueSafe = () => {
  const $user = get(userDecrStore) as StoreValue<typeof userDecrStore>;
  // It is undefined only in case user, b64salt or keys are not yet set.
  if (!$user) throw new Error('Cannot update user data before setting keys');
  return $user;
};

export const updateUserDecr = async (data: Partial<UserDecrPart>) => {
  const $user = getStoreValueSafe(),
    encrUserData = await encrypt({ ...$user.decr, ...data }, $user.id, $user.b64salt!);

  return userEncrStore.update($state => ({
    ...$state!,
    clientUpdated: new Date().getTime(),
    encr: encode(encrUserData),
  }));
};

export const addJointWallet = async (data: Omit<JointWallet, 'id'>) =>
    updateJointWallet({ id: nanoid(), ...data }),
  updateJointWallet = async (data: JointWallet) => {
    const $user = getStoreValueSafe(),
      { id } = data;

    await updateUserDecr({
      ...$user.decr,
      jointWallets: { ...$user.decr.jointWallets, [id]: data },
    });
    return data;
  };

export const addUserScheme = async (data: BaseSimpleScheme) => {
  const $user = getStoreValueSafe();
  await updateUserDecr({
    ...$user.decr,
    schemes: [...($user.decr.schemes || []), data],
  });
};

export const hasUserSeenOnboarding = derived(
  userDecrStore,
  $user => (key: OnboardingSteps) => $user?.decr.settings?.onboarding?.[key],
);

export const setUserSetting = <
    K extends keyof BooleanCheck<UserDecrPart['settings']>,
    V extends BooleanCheck<UserDecrPart['settings']>[K],
  >(
    key: K,
    value: V,
  ) => {
    const $user = getStoreValueSafe();
    return updateUserDecr({
      ...$user.decr,
      settings: { ...$user.decr.settings, [key]: value },
    });
  },
  setUserOnboardingSetting = async (key: OnboardingSteps) => {
    const $user = getStoreValueSafe();
    if (!$user.decr.settings?.onboarding?.[key])
      return updateUserDecr({
        ...$user.decr,
        settings: {
          ...$user.decr.settings,
          onboarding: { ...$user.decr.settings?.onboarding, [key]: true },
        },
      });
  };
