export function formatNumber(num: number, locale: string = "id-ID"): string {
  return num
    .toLocaleString(locale, {
      useGrouping: true,
      maximumFractionDigits: 0,
    })
    .replace(/\./g, ",");
}
