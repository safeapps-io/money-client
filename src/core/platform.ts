import { derived } from 'svelte/store';
import { media } from 'svelte-match-media';

export const isMobile = derived(media, $media => {
    let hasTouchScreen = 'maxTouchPoints' in navigator ? navigator.maxTouchPoints > 0 : false;
    return hasTouchScreen && $media.mobile;
  }),
  isMac = () => navigator.platform.indexOf('Mac') > -1;

export const cmdKey = () => (isMac() ? '⌘' : 'Ctrl'),
  altKey = () => (isMac() ? '⌥' : 'Alt'),
  backspaceKey = () => (isMac() ? '⌫' : '←');
