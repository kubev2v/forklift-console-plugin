/**
 * Saves the inventory data to cache.
 * @param {string} cacheKey - The key used to store inventory data in cache.
 * @param {T} data - The inventory data to be cached.
 */
export function setCachedData<T>(cacheKey: string, data: T): void {
  const cacheData = {
    data,
    timestamp: Date.now(),
  };

  sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
}

export default setCachedData;
