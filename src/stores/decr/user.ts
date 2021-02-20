import { nanoid } from 'nanoid';
import { derived, get } from 'svelte/store';
import { encode } from 'base64-arraybuffer';

import { copy } from '@/utils/object';

import { encryptionService } from '@/services/crypto/cryptoService';
import { userEncrStore, UserEncrState } from '@/stores/user';
import { encryptionKeysStateStore } from '@/stores/encr/keysState';
import { AutomationSettings, BaseSimpleScheme } from '@/core/import/types';
import { JointWallet } from './types';

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
    if (!$user || !$user.b64salt || !$keysState.encryptionKeySet) return;

    const { encr, ...restUser } = $user;
    if (!encr) return set({ ...restUser, decr: copy(defaultDecrState) });

    encryptionService
      .decrypt<UserDecrPart>({
        id: $user.id,
        additionalData: $user.b64salt,
        b64data: encr,
      })
      .then(res => set({ ...restUser, decr: res }));
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
    encrUserData = await encryptionService.encrypt({
      id: $user.id,
      additionalData: $user.b64salt!,
      data: { ...$user.decr, ...data },
    });

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

export const hasUserSeenOnboarding = derived(userDecrStore, $user => (key: OnboardingSteps) =>
  $user?.decr.settings?.onboarding?.[key],
);

export const setUserSetting = <
    K extends keyof BooleanCheck<UserDecrPart['settings']>,
    V extends BooleanCheck<UserDecrPart['settings']>[K]
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
