export function createIndexedBase64Object(encodedString: string): Record<number, string> {
  // Parse the JSON encoded string to get the list of strings
  const list: string[] = JSON.parse(encodedString || '[]');

  // Check for empty list
  if (!list || list.filter((item) => item).length === 0) {
    return undefined;
  }

  // Create an object with index as key and base64 encoded string as value
  const result: Record<number, string> = {};
  list
    .filter((item) => item)
    .forEach((item, index) => {
      const base64Encoded = btoa(item); // Encode the string to base64
      result[index] = base64Encoded;
    });

  return result;
}
