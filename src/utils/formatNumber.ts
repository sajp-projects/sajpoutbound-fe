export function formatNumber(num: number, locale: string = "id-ID"): string {
  return num
    .toLocaleString(locale, {
      useGrouping: true,
      maximumFractionDigits: 0,
    })
    .replace(/\./g, ",");
}

/**
 * Format a number for display with Indonesian formatting (dots for thousands, comma for decimal)
 * @param value - The numeric value
 * @returns Formatted string (e.g. 12345.75 -> "12.345,75")
 */
export function formatInputNumber(value: string | number): string {
  if (!value && value !== 0) return '';

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '';

  // Split into integer and decimal parts
  const parts = numValue.toString().split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Format integer part with dots as thousands separators
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Return with comma as decimal separator if there's a decimal part
  return decimalPart ? `${formattedInteger},${decimalPart}` : formattedInteger;
}

/**
 * Simple number input handler for Indonesian format
 * Only allows comma (,) as decimal separator
 * @param inputValue - Raw input value
 * @param currentValue - Current numeric value for context
 * @returns Object with formatted display value and clean numeric value
 */
export function handleDecimalInput(inputValue: string) {
  // Remove all non-numeric characters except comma
  let cleaned = inputValue.replace(/[^\d,]/g, '');

  // Only allow one comma
  const commaCount = (cleaned.match(/,/g) || []).length;
  if (commaCount > 1) {
    // Keep only the first comma
    const firstCommaIndex = cleaned.indexOf(',');
    cleaned = cleaned.substring(0, firstCommaIndex + 1) +
              cleaned.substring(firstCommaIndex + 1).replace(/,/g, '');
  }

  // Split by comma to get integer and decimal parts
  const parts = cleaned.split(',');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // For display: format integer part with dots, keep comma for decimal
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const displayValue = decimalPart !== undefined ?
    `${formattedInteger},${decimalPart}` :
    formattedInteger;

  // For numeric value: convert comma to dot for parseFloat
  const numericString = decimalPart !== undefined ?
    `${integerPart}.${decimalPart}` :
    integerPart;
  const numericValue = numericString ? parseFloat(numericString) : undefined;

  return {
    displayValue,
    numericValue: isNaN(numericValue as number) ? undefined : numericValue
  };
}
