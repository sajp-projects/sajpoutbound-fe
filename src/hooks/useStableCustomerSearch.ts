import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useInfiniteCustomers } from './customer';
import { Customer } from '@/types/customer';
import { fetchApi } from '@/utils/api';

interface UseStableCustomerSearchProps {
  enabled: boolean;
  limit?: number;
}

export function useStableCustomerSearch({ enabled, limit = 20 }: UseStableCustomerSearchProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Use ref to prevent unnecessary re-renders
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  // Base query for initial data load (with stable key)
  const {
    data: customersData,
    isLoading: isLoadingCustomers,
    error: customersError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCustomers({
    enabled,
    limit,
    searchQuery: "", // Keep empty for stable query
  });

  // Update allCustomers when base data changes (memoized)
  const baseCustomers = useMemo(() => {
    return customersData?.pages.flatMap((page) => page.customers) || [];
  }, [customersData]);

  useEffect(() => {
    if (baseCustomers.length > 0 && !searchQuery) {
      setAllCustomers(baseCustomers);
    }
  }, [baseCustomers, searchQuery]);

  // Handle search with manual API call
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      // Reset to original data when search is cleared
      setAllCustomers(baseCustomers);
      return;
    }

    setIsSearching(true);
    try {
      // Manual API call for search using fetchApi utility
      const response = await fetchApi('/customers', {
        search: query,
        limit: '50',
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setAllCustomers(result.data.customers);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [baseCustomers]);

  // Search handler for combobox
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    performSearch(query);
  }, [performSearch]);

  // Reset search when disabled
  useEffect(() => {
    if (!enabled) {
      setSearchQuery("");
      setAllCustomers([]);
    }
  }, [enabled]);

  return {
    // Data
    customers: allCustomers,
    searchQuery,
    
    // Loading states
    isLoading: isLoadingCustomers && allCustomers.length === 0,
    isSearching,
    error: customersError,
    
    // Pagination (from base query)
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    
    // Search handler
    onSearch: handleSearch,
    
    // Reset function
    resetSearch: useCallback(() => {
      setSearchQuery("");
      setAllCustomers(baseCustomers);
    }, [baseCustomers])
  };
}