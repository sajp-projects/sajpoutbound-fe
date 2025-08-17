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
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import * as React from "react";

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
  disabled?: boolean;
  searchable?: boolean;
  // Infinite scroll props
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
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
  disabled = false,
  searchable = true,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const searchTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Filter items locally if not using server search and deduplicate
  const filteredItems = React.useMemo(() => {
    let itemsToFilter = items;

    // Deduplicate items by value to prevent duplicate keys
    if (useServerSearch) {
      const seen = new Set();
      itemsToFilter = items.filter((item) => {
        if (seen.has(item.value)) {
          return false;
        }
        seen.add(item.value);
        return true;
      });
    }

    if (searchQuery === "") return itemsToFilter;

    const lowercaseQuery = searchQuery.toLowerCase().trim();
    return itemsToFilter.filter((item) => {
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
          setSearching(false);
          searchTimerRef.current = null;
        }, 300);
      }
    },
    [useServerSearch, onSearch]
  );

  // Handle infinite scroll
  const handleScroll = React.useCallback(() => {
    if (!listRef.current || !hasMore || isLoadingMore) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const threshold = 50; // pixels from bottom

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      onLoadMore?.();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

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
        <Popover open={open} onOpenChange={setOpen} modal={true}>
          <PopoverTrigger asChild>
            <Button
              id={name}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
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
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onClear();
                      setOpen(false);
                    }}
                    className="flex items-center justify-center w-4 h-4 p-0 mr-1 text-gray-400 cursor-pointer hover:text-gray-500"
                  >
                    <X className="w-4 h-4" />
                  </div>
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
              "w-[var(--radix-popover-trigger-width)] min-w-[200px] max-w-[400px] p-0 bg-white shadow-lg border border-gray-200",
              popoverClassName
            )}
            align="start"
            side="bottom"
          >
            <Command shouldFilter={!useServerSearch}>
              {searchable && (
                <CommandInput
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onValueChange={handleSearchChange}
                  className="border-none focus:ring-0"
                />
              )}
              <CommandList
                ref={listRef}
                onScroll={handleScroll}
                className="max-h-60 overflow-y-auto"
              >
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
                          className="flex items-center"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 shrink-0",
                              value === item.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="truncate">{item.label}</div>
                            {item.secondary && (
                              <div className="text-xs text-gray-500 truncate">
                                {item.secondary}
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {/* Load more indicator */}
                    {hasMore && (
                      <div className="p-2 border-t border-gray-100">
                        {isLoadingMore ? (
                          <div className="flex items-center justify-center p-2 text-sm text-gray-500">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Memuat lebih banyak...
                          </div>
                        ) : (
                          <div className="text-center p-2 text-sm text-gray-500">
                            Scroll untuk memuat lebih banyak
                          </div>
                        )}
                      </div>
                    )}
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
