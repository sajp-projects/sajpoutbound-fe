import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export function SearchInput({ placeholder = "Cari...", className = "", debounceMs = 300 }: SearchInputProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [searchInputValue, setSearchInputValue] = useState(searchQuery);

  // Handle search (debounced)
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchInputValue === searchQuery) return;

      // Update search params
      const newParams = new URLSearchParams(searchParams);
      if (searchInputValue) {
        newParams.set("search", searchInputValue);
      } else {
        newParams.delete("search");
      }
      // Reset ke halaman 1 saat pencarian
      newParams.set("page", "1");

      setSearchParams(newParams, { replace: false });
    }, debounceMs);

    return () => clearTimeout(delay);
  }, [searchInputValue, searchParams, setSearchParams, searchQuery, debounceMs]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input type="search" placeholder={placeholder} className="w-full pl-10 py-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md" value={searchInputValue} onChange={(e) => setSearchInputValue(e.target.value)} />
    </div>
  );
}
