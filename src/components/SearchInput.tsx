import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export function SearchInput({
  placeholder = "Cari...",
  className = "",
  debounceMs = 300,
}: SearchInputProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [value, setValue] = useState(searchQuery);

  useEffect(() => {
    if (value === searchQuery) return;

    const delay = setTimeout(() => {
      const params = Object.fromEntries(searchParams.entries());

      if (value) {
        params.search = value;
      } else {
        delete params.search;
      }
      params.page = "1";

      setSearchParams(params);
    }, debounceMs);

    return () => clearTimeout(delay);
  }, [value, searchQuery, searchParams, setSearchParams, debounceMs]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
      <Input
        type="search"
        placeholder={placeholder}
        className="w-full py-2 pl-10 border-gray-300 rounded-md"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
