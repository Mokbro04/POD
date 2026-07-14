import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a price in Algerian Dinar, e.g. 2500 -> "2 500 DA" */
export function formatDZD(amount: number) {
  return `${amount.toLocaleString("fr-FR")} DA`;
}
