import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

//used to cleanly merge tailwindCSS class name
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
