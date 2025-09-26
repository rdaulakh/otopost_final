// API Hook for Data Fetching
import { useState, useEffect, useCallback, useRef } from 'react';
import { handleError } from '../utils/errors/errorHandler.js';
import { debugLog } from '../config/environment.js';

// useApi Hook - Generic API hook
export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);
  
  const {
    immediate = true,
    onSuccess = null,
    onError = null,
    transform = null,
    cache = false,
    cacheKey = null,
    retries = 0,
    retryDelay = 1000,
  } = options;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(async (...args) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      if (isMountedRef.current) {
        setLoading(true);
        setError(null);
      }

      // Check cache first
      if (cache && cacheKey) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          debugLog('Using cached data for:', cacheKey);
          if (isMountedRef.current) {
            setData(cachedData);
            setLoading(false);
          }
          return cachedData;
        }
      }

      let attempt = 0;
      let lastError = null;

      while (attempt <= retries) {
        try {
          const result = await apiFunction(...args, {
            signal: abortControllerRef.current.signal,
          });

          if (!isMountedRef.current) return result;

          // Transform data if transformer provided
          const transformedData = transform ? transform(result) : result;

          // Cache data if caching enabled
          if (cache && cacheKey) {
            setCachedData(cacheKey, transformedData);
          }

          setData(transformedData);
          setLastFetch(new Date());
          
          if (onSuccess) {
            onSuccess(transformedData);
          }

          debugLog('API call successful:', { apiFunction: apiFunction.name, data: transformedData });
          return transformedData;

        } catch (err) {
          lastError = err;
          
          // Don't retry if request was aborted
          if (err.name === 'AbortError') {
            debugLog('API call aborted');
            return null;
          }

          attempt++;
          
          if (attempt <= retries) {
            debugLog(`API call failed, retrying (${attempt}/${retries}):`, err);
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          }
        }
      }

      // All retries failed
      throw lastError;

    } catch (err) {
      if (!isMountedRef.current) return null;

      const appError = handleError(err, { 
        apiFunction: apiFunction.name, 
        args,
        retries,
      });
      
      setError(appError);
      
      if (onError) {
        onError(appError);
      }

      throw appError;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunction, transform, onSuccess, onError, cache, cacheKey, retries, retryDelay]);

  // Auto-execute on mount and dependency changes
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute, ...dependencies]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearData = useCallback(() => {
    setData(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    clearError,
    clearData,
    lastFetch,
  };
};

// usePaginatedApi Hook - For paginated data
export const usePaginatedApi = (apiFunction, initialParams = {}, options = {}) => {
  const [allData, setAllData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  
  const [params, setParams] = useState(initialParams);
  
  const {
    data,
    loading,
    error,
    execute,
    refetch,
    clearError,
  } = useApi(
    (...args) => apiFunction({ ...params, ...args[0] }),
    [params],
    {
      ...options,
      immediate: false,
      onSuccess: (result) => {
        if (result.data) {
          setAllData(result.data);
        }
        if (result.pagination) {
          setPagination(result.pagination);
        }
        if (options.onSuccess) {
          options.onSuccess(result);
        }
      },
    }
  );

  const loadPage = useCallback((page) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  const nextPage = useCallback(() => {
    if (pagination.hasNext) {
      loadPage(pagination.page + 1);
    }
  }, [pagination.hasNext, pagination.page, loadPage]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrev) {
      loadPage(pagination.page - 1);
    }
  }, [pagination.hasPrev, pagination.page, loadPage]);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams, page: 1 }));
  }, []);

  const refresh = useCallback(() => {
    return execute();
  }, [execute]);

  // Initial load
  useEffect(() => {
    execute();
  }, [execute]);

  return {
    data: allData,
    pagination,
    loading,
    error,
    params,
    loadPage,
    nextPage,
    prevPage,
    updateParams,
    refresh,
    clearError,
  };
};

// useMutation Hook - For create/update/delete operations
export const useMutation = (mutationFunction, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  const {
    onSuccess = null,
    onError = null,
    onSettled = null,
  } = options;

  const mutate = useCallback(async (variables) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await mutationFunction(variables);
      setData(result);
      
      if (onSuccess) {
        onSuccess(result, variables);
      }
      
      debugLog('Mutation successful:', { mutationFunction: mutationFunction.name, result });
      return result;
      
    } catch (err) {
      const appError = handleError(err, { 
        mutationFunction: mutationFunction.name, 
        variables,
      });
      
      setError(appError);
      
      if (onError) {
        onError(appError, variables);
      }
      
      throw appError;
    } finally {
      setLoading(false);
      
      if (onSettled) {
        onSettled(data, error);
      }
    }
  }, [mutationFunction, onSuccess, onError, onSettled]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    data,
    loading,
    error,
    reset,
  };
};

// Cache utilities
const cache = new Map();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_EXPIRY) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
};

const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

// Clear cache
export const clearCache = (key = null) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

// useInfiniteQuery Hook - For infinite scrolling
export const useInfiniteQuery = (queryFunction, options = {}) => {
  const [pages, setPages] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  
  const {
    getNextPageParam = (lastPage) => lastPage.nextCursor,
    initialPageParam = null,
  } = options;

  const {
    data: currentPage,
    loading,
    error,
    execute,
    clearError,
  } = useApi(
    (pageParam) => queryFunction(pageParam || initialPageParam),
    [],
    {
      ...options,
      immediate: false,
      onSuccess: (result) => {
        setPages(prev => [...prev, result]);
        const nextParam = getNextPageParam(result);
        setHasNextPage(!!nextParam);
        
        if (options.onSuccess) {
          options.onSuccess(result);
        }
      },
    }
  );

  const fetchNextPage = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    
    try {
      setIsFetchingNextPage(true);
      const lastPage = pages[pages.length - 1];
      const nextParam = getNextPageParam(lastPage);
      await execute(nextParam);
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [hasNextPage, isFetchingNextPage, pages, getNextPageParam, execute]);

  const refetch = useCallback(() => {
    setPages([]);
    setHasNextPage(true);
    return execute(initialPageParam);
  }, [execute, initialPageParam]);

  // Initial load
  useEffect(() => {
    execute(initialPageParam);
  }, [execute, initialPageParam]);

  // Flatten all data
  const allData = pages.reduce((acc, page) => {
    return acc.concat(page.data || []);
  }, []);

  return {
    data: allData,
    pages,
    loading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    clearError,
  };
};

export default useApi;

