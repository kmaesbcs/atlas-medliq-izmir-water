import { writable } from 'svelte/store';
import {MOBILE_WIDTH} from "@components/common";

export const muted = writable(true);
export const legendOpen = writable(false);

export const isMobile = writable(window.innerWidth <= MOBILE_WIDTH);
window.addEventListener('resize', () => {
  isMobile.set(window.innerWidth <= MOBILE_WIDTH);
})
