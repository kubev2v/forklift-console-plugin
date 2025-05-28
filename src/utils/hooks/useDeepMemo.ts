import { useRef } from 'react';

// Custom hook for deep comparison memoization
export const useDeepMemo = <T>(value: T): T => {
  const ref = useRef<T>(value);
  const serializedValue = JSON.stringify(value);
  const serializedRef = useRef(serializedValue);

  if (serializedValue !== serializedRef.current) {
    ref.current = value;
    serializedRef.current = serializedValue;
  }

  return ref.current;
};
