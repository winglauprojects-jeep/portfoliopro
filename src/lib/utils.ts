import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper: Generates N distinct shades of a specific Hue
// hue: 210 (Blue), 150 (Green), etc.
export const generateColors = (count: number, hue: number) => {
  return Array.from({ length: count }, (_, i) => {
    // We spread the lightness from 30% (dark) to 80% (light)
    // If there's only 1 item, we use 50% lightness.
    const lightness = count > 1 ? 30 + i * (50 / (count - 1)) : 50;

    // Return a standard HSL color string
    return `hsl(${hue}, 75%, ${lightness}%)`;
  });
};
