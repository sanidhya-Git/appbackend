import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

// Reference dimensions (iPhone 14 / Pixel 7)
const BASE_W = 390;
const BASE_H = 844;

/**
 * Scale a size proportionally to screen width.
 * Good for widths, heights, border radii, paddings.
 */
export function rs(size: number): number {
  return Math.round(PixelRatio.roundToNearestPixel((W / BASE_W) * size));
}

/**
 * Moderate scale — scales less aggressively than rs().
 * Ideal for font sizes and icon sizes so text doesn't get huge on tablets.
 * factor 0 = no scale, factor 1 = full linear scale.
 */
export function ms(size: number, factor = 0.4): number {
  return Math.round(PixelRatio.roundToNearestPixel(size + (rs(size) - size) * factor));
}

/**
 * Vertical scale based on screen height.
 */
export function vs(size: number): number {
  return Math.round(PixelRatio.roundToNearestPixel((H / BASE_H) * size));
}

/** Screen dimensions */
export const SCREEN_WIDTH = W;
export const SCREEN_HEIGHT = H;

/** True if running on a small screen (< 360 dp wide) */
export const isSmallScreen = W < 360;

/** True if running on a large screen (>= 428 dp wide, e.g. Plus/Max phones) */
export const isLargeScreen = W >= 428;
