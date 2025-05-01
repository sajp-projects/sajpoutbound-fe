/**
 * Format tanggal ke format yang lebih readable
 * @param dateString string tanggal dalam format ISO
 * @returns tanggal yang sudah diformat
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format tanggal ke format yang lebih ringkas
 * @param dateString string tanggal dalam format ISO
 * @returns tanggal yang sudah diformat secara ringkas
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
