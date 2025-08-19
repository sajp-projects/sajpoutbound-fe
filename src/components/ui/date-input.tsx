import { cn } from "@/lib/utils";
import { validateDateString } from "@/utils/dateValidation";
import React, { useEffect, useState } from "react";
import { Input } from "./input";

interface DateInputProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  onValidationChange?: (isValid: boolean, hasInput: boolean) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

export function DateInput({
  value,
  onChange,
  onValidationChange,
  placeholder = "DD-MM-YYYY HH:MM",
  className,
  disabled = false,
  error = false,
}: DateInputProps) {
  const [rawInput, setRawInput] = useState("");

  useEffect(() => {
    if (value) {
      const day = value.getDate().toString().padStart(2, "0");
      const month = (value.getMonth() + 1).toString().padStart(2, "0");
      const year = value.getFullYear().toString();
      const hours = value.getHours().toString().padStart(2, "0");
      const minutes = value.getMinutes().toString().padStart(2, "0");

      setRawInput(`${day}${month}${year}${hours}${minutes}`);
    }
  }, [value]);

  const buildDisplayValue = (digits: string): string => {
    let result = "";

    if (digits.length >= 1) result += digits[0];
    if (digits.length >= 2) result += digits[1];
    if (digits.length >= 2) result += "-";

    if (digits.length >= 3) result += digits[2];
    if (digits.length >= 4) result += digits[3];
    if (digits.length >= 4) result += "-";

    if (digits.length >= 5) result += digits[4];
    if (digits.length >= 6) result += digits[5];
    if (digits.length >= 7) result += digits[6];
    if (digits.length >= 8) result += digits[7];
    if (digits.length >= 8) result += " ";

    if (digits.length >= 9) result += digits[8];
    if (digits.length >= 10) result += digits[9];
    if (digits.length >= 10) result += ":";

    if (digits.length >= 11) result += digits[10];
    if (digits.length >= 12) result += digits[11];

    return result;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      // Remove last digit from rawInput
      setRawInput((prev) => {
        const newRaw = prev.slice(0, -1);

        // Notify parent about validation state
        if (onValidationChange) {
          const isValid = newRaw.length === 12 && validateDateString(newRaw);
          onValidationChange(isValid, newRaw.length > 0);
        }

        onChange(null); // still notify parent it's incomplete
        return newRaw;
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, ""); // only keep numbers
    if (digits.length <= 12) {
      setRawInput(digits);

      // Notify parent about validation state
      if (onValidationChange) {
        const isValid = digits.length === 12 && validateDateString(digits);
        onValidationChange(isValid, digits.length > 0);
      }

      if (digits.length === 12 && validateDateString(digits)) {
        const day = parseInt(digits.slice(0, 2));
        const month = parseInt(digits.slice(2, 4)) - 1;
        const year = parseInt(digits.slice(4, 8));
        const hours = parseInt(digits.slice(8, 10));
        const minutes = parseInt(digits.slice(10, 12));
        onChange(new Date(year, month, day, hours, minutes));
      } else {
        onChange(null);
      }
    }
  };

  const handleBlur = () => {
    if (rawInput.length < 12) {
      setRawInput("");
      onChange(null);

      // Notify parent about validation state
      if (onValidationChange) {
        onValidationChange(false, false);
      }
    }
  };

  const hasError = error || (rawInput.length === 12 && !validateDateString(rawInput));
  const displayValue = buildDisplayValue(rawInput);

  return (
    <>
      <div className="relative">
        <Input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            "font-mono pr-24", // extra right padding so text doesn't overlap error
            hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          disabled={disabled}
        />
        {hasError && rawInput.length === 12 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-500 pointer-events-none">
            Tanggal tidak valid
          </div>
        )}
      </div>
      <div className="mt-1 text-xs text-gray-500 font-mono">
        Format: DD-MM-YYYY HH:MM
      </div>
    </>
  );
}
