import { MENU_ITEMS } from './mockMenu';

/**
 * Get the current menu items — reads from localStorage (kitchen updates) 
 * and falls back to static MENU_ITEMS if no kitchen changes exist.
 */
export function getMenuItems() {
  try {
    const saved = localStorage.getItem('synnoviq_menu');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // ignore parse errors
  }
  return MENU_ITEMS;
}
