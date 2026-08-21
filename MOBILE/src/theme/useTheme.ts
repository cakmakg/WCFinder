/**
 * useTheme — typed access to design tokens.
 *
 * Today returns the single light "Soft Glass" token set. Kept as a hook so a
 * dark variant can be introduced later (switch on color scheme) without
 * changing any component call sites.
 */

import { tokens, type Tokens } from './tokens';

export const useTheme = (): Tokens => tokens;
