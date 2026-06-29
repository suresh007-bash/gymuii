import { MENU_ITEMS } from './mockMenu';

/**
 * Get the current menu items — reads from localStorage (kitchen updates) 
 * and falls back to static MENU_ITEMS if no kitchen changes exist.
 */
export function getMenuItems() {
  try {
    const saved = localStorage.getItem('synnoviq_menu');
    
    // Force reset to apply new image fixes (remove this block later if needed)
    if (saved) {
      const parsed = JSON.parse(saved);
      // Force refresh if the cached menu length doesn't match our new mock data
      if (parsed.length !== MENU_ITEMS.length || parsed.some(item => item.image && item.image.includes('kitchen_menu1'))) {
        localStorage.removeItem('synnoviq_menu');
        return MENU_ITEMS;
      }
      return parsed;
    }
  } catch (e) {
    // ignore parse errors
  }
  return MENU_ITEMS;
}
