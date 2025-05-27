import * as React from "react";
import { Check, ChevronsUpDown, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxItem {
  label: string;
  value: string;
  secondary?: string;
}

interface ComboboxProps {
  items: ComboboxItem[];
  value: string;
  onValueChange: (value: string) => void;
  onSelect?: (item: ComboboxItem) => void;
  placeholder: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  error?: string;
  name: string;
  label?: string;
  helpText?: string;
  required?: boolean;
  onClear?: () => void;
  emptyMessage?: string;
  className?: string;
  popoverClassName?: string;
  onSearch?: (query: string) => void;
  useServerSearch?: boolean;
}

export function Combobox({
  items,
  value,
  onValueChange,
  onSelect,
  placeholder,
  searchPlaceholder = "Cari...",
  isLoading,
  error,
  name,
  label,
  helpText,
  required,
  onClear,
  emptyMessage = "Tidak ada data yang cocok",
  className,
  popoverClassName,
  onSearch,
  useServerSearch = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const searchTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Filter items locally if not using server search
  const filteredItems = React.useMemo(() => {
    if (useServerSearch) return items;

    if (searchQuery === "") return items;

    const lowercaseQuery = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      // Cek apakah query ada di label (case insensitive)
      const itemLabel = item.label.toLowerCase();
      if (itemLabel.includes(lowercaseQuery)) return true;

      // Cek juga pada secondary text jika ada
      if (
        item.secondary &&
        item.secondary.toLowerCase().includes(lowercaseQuery)
      )
        return true;

      // Cek juga pada value jika perlu
      return item.value.toLowerCase().includes(lowercaseQuery);
    });
  }, [items, searchQuery, useServerSearch]);

  const selectedItem = React.useMemo(() => {
    return items.find((item) => item.value === value);
  }, [items, value]);

  // Handle search with debounce
  const handleSearchChange = React.useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (useServerSearch && onSearch) {
        setSearching(true);

        // Clear previous timer
        if (searchTimerRef.current) {
          clearTimeout(searchTimerRef.current);
        }

        // Set new timer for debounce (wait 300ms before sending query)
        searchTimerRef.current = setTimeout(() => {
          onSearch(query);
          searchTimerRef.current = null;
        }, 300);
      }
    },
    [useServerSearch, onSearch]
  );

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  // Update searching state when isLoading changes
  React.useEffect(() => {
    if (!isLoading && searching) {
      setSearching(false);
    }
  }, [isLoading, searching]);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block mb-1 text-sm font-medium text-gray-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={name}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between h-10",
                "text-left font-normal",
                error ? "border-red-500" : "",
                className
              )}
            >
              {selectedItem ? selectedItem.label : placeholder}
              <div className="flex ml-2">
                {value && onClear && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClear();
                      setOpen(false);
                    }}
                    className="w-4 h-4 p-0 mr-1 text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin opacity-70" />
                ) : (
                  <ChevronsUpDown className="w-4 h-4 opacity-50 shrink-0" />
                )}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className={cn(
              "w-full p-0 bg-white shadow-lg border border-gray-200",
              popoverClassName
            )}
            align="start"
            side="bottom"
          >
            <Command shouldFilter={!useServerSearch}>
              <CommandInput
                placeholder={searchPlaceholder}
                value={searchQuery}
                onValueChange={handleSearchChange}
                className="border-none focus:ring-0"
              />
              <CommandList>
                {isLoading ? (
                  <div className="flex items-center justify-center p-4 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memuat...
                  </div>
                ) : (
                  <>
                    <CommandEmpty>{emptyMessage}</CommandEmpty>
                    <CommandGroup>
                      {filteredItems.map((item) => (
                        <CommandItem
                          key={item.value}
                          value={item.value}
                          onSelect={() => {
                            onValueChange(item.value);
                            if (onSelect) onSelect(item);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === item.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {item.label}
                          {item.secondary ? ` (${item.secondary})` : ""}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      {error ? (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      ) : helpText ? (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      ) : null}
    </div>
  );
}
