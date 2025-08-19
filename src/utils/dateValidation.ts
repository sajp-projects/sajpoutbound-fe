/**
 * Validates if a date string in DDMMYYYYHHMM format is valid
 * @param dateString - Date string in DDMMYYYYHHMM format (12 digits)
 * @returns boolean indicating if the date is valid
 */
export function validateDateString(dateString: string): boolean {
  if (!dateString || dateString.length !== 12) {
    return false;
  }

  // Extract components
  const day = parseInt(dateString.slice(0, 2));
  const month = parseInt(dateString.slice(2, 4));
  const year = parseInt(dateString.slice(4, 8));
  const hours = parseInt(dateString.slice(8, 10));
  const minutes = parseInt(dateString.slice(10, 12));

  // Basic range validation
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (hours < 0 || hours > 23) return false;
  if (minutes < 0 || minutes > 59) return false;

  // Create Date object and validate it's actually valid
  const date = new Date(year, month - 1, day, hours, minutes);

  return (
    date.getDate() === day &&
    date.getMonth() === month - 1 &&
    date.getFullYear() === year &&
    date.getHours() === hours &&
    date.getMinutes() === minutes
  );
}

/**
 * Validates if a Date object is valid
 * @param date - Date object to validate
 * @returns boolean indicating if the date is valid
 */
export function validateDate(date: Date | null | undefined): boolean {
  if (!date) return false;

  // Check if it's a valid Date object
  if (isNaN(date.getTime())) return false;

  return true;
}

/**
 * Converts a Date object to DDMMYYYYHHMM string format
 * @param date - Date object to convert
 * @returns string in DDMMYYYYHHMM format
 */
export function dateToDDMMYYYYHHMM(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}${month}${year}${hours}${minutes}`;
}

/**
 * Converts a DDMMYYYYHHMM string to a Date object
 * @param dateString - Date string in DDMMYYYYHHMM format
 * @returns Date object or null if invalid
 */
export function DDMMYYYYHHMMToDate(dateString: string): Date | null {
  if (!validateDateString(dateString)) {
    return null;
  }

  const day = parseInt(dateString.slice(0, 2));
  const month = parseInt(dateString.slice(2, 4)) - 1; // Month is 0-indexed
  const year = parseInt(dateString.slice(4, 8));
  const hours = parseInt(dateString.slice(8, 10));
  const minutes = parseInt(dateString.slice(10, 12));

  return new Date(year, month, day, hours, minutes);
}