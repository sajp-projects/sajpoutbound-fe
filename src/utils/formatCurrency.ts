/**
 * Format a number to Indonesian Rupiah format
 * @param amount - The amount to format
 * @returns Formatted rupiah string
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse a rupiah string back to number
 * @param rupiahString - The rupiah string to parse (e.g., "Rp 100.000")
 * @returns The parsed number
 */
export function parseRupiah(rupiahString: string): number {
  // Remove currency symbol, dots, and replace comma with dot
  const cleanedString = rupiahString.replace(/[^\d,]/g, "").replace(",", ".");
  return parseFloat(cleanedString) || 0;
}
