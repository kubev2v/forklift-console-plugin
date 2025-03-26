/**
 * Fetches cached inventory data if it's still valid.
 * @param {string} cacheKey - The key used to store inventory data in cache.
 * @param {number} cacheExpiryDuration - The duration till cache is valid.
 * @returns {T | null} - The cached inventory data if valid, null otherwise.
 */
export function getCachedData<T>(cacheKey: string, cacheExpiryDuration: number): T | null {
  if (cacheExpiryDuration < 1) {
    return null;
  }

  const cacheData = sessionStorage.getItem(cacheKey);
  if (cacheData) {
    const { data, timestamp } = JSON.parse(cacheData);

    // If cache is not expired, return data
    if (Date.now() - timestamp < cacheExpiryDuration) {
      return data;
    }
  }

  return null;
}

export default getCachedData;
