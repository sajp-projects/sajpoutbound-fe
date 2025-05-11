export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseRupiah(rupiahString: string): number {
  const cleanedString = rupiahString.replace(/[^\d,]/g, "").replace(",", ".");
  return parseFloat(cleanedString) || 0;
}
