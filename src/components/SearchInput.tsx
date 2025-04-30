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
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input type="search" placeholder={placeholder} className="w-full pl-10 py-2 rounded-md" value={value} onChange={(e) => setValue(e.target.value)} />
    </div>
  );
}
