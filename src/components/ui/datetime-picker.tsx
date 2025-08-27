import { cn } from "@/lib/utils";
import { toZonedTime } from "date-fns-tz";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateTimePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal dan waktu",
  className,
  disabled = false,
  error = false,
}: DateTimePickerProps) {
  // Convert value to Jakarta timezone for display
  const displayValue = value ? toZonedTime(value, "Asia/Jakarta") : null;

  const handleChange = (date: Date | null) => {
    if (date) {
      // Convert back to Date object assuming Jakarta timezone
      const jakartaDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      onChange(jakartaDate);
    } else {
      onChange(null);
    }
  };

  return (
    <DatePicker
      selected={displayValue}
      onChange={handleChange}
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={15}
      timeCaption="Waktu"
      dateFormat="dd/MM/yyyy HH:mm"
      placeholderText={placeholder}
      disabled={disabled}
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-gray-300 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-blue-500/50 focus-visible:ring-[3px]",
        error && "border-red-600 focus-visible:ring-red-500/50",
        className
      )}
      wrapperClassName="w-full"
      popperClassName="react-datepicker-popper"
      popperPlacement="bottom-start"
    />
  );
}