import { format, parseISO } from "date-fns";
import React, { useState } from "react";
import type { RangeKeyDict } from "react-date-range";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface DateRangeFilterProps {
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  onChange: (range: { startDate: string; endDate: string }) => void;
  label?: string;
  maxDate?: Date;
  className?: string;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onChange,
  label = "Tanggal:",
  maxDate = new Date(),
  className = "",
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  function safeFormat(dateStr: string) {
    if (!dateStr) return "-";
    const d = parseISO(dateStr);
    if (isNaN(d.getTime())) return "-";
    return format(d, "dd MMM yyyy");
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 relative ${className}`}>
      {label && (
        <label className="text-sm text-gray-600 font-medium">{label}</label>
      )}
      <button
        className="border rounded px-2 py-1 text-sm bg-white hover:bg-gray-50 flex items-center"
        onClick={() => setShowDatePicker((v) => !v)}
        type="button"
      >
        {safeFormat(startDate)} s/d {safeFormat(endDate)}
      </button>
      {showDatePicker && (
        <div className="absolute z-50 top-10 left-0 md:left-auto md:right-0 bg-white shadow-lg rounded border p-2">
          <DateRange
            ranges={[
              {
                startDate: startDate ? parseISO(startDate) : new Date(),
                endDate: endDate ? parseISO(endDate) : new Date(),
                key: "selection",
              },
            ]}
            onChange={(ranges: RangeKeyDict) => {
              const sel = ranges.selection;
              onChange({
                startDate: format(sel.startDate!, "yyyy-MM-dd"),
                endDate: format(sel.endDate!, "yyyy-MM-dd"),
              });
            }}
            maxDate={maxDate}
            showMonthAndYearPickers={true}
            rangeColors={["#2563eb"]}
            direction="vertical"
            showDateDisplay={false}
            editableDateInputs={true}
            onRangeFocusChange={(focused) => {
              // Close picker if both dates are selected and focus is lost
              if (!focused || (focused[0] === 0 && focused[1] === 0)) {
                setShowDatePicker(false);
              }
            }}
          />
          <div className="flex justify-end mt-2">
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
              onClick={() => setShowDatePicker(false)}
              type="button"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
