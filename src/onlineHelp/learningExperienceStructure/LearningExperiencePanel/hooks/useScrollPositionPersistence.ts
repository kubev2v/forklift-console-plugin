import { type RefCallback, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { createCancellableDebounce } from '@utils/debounce';

type UseScrollPositionPersistenceOptions = {
  /** The current saved scroll position to restore */
  savedPosition: number;
  /** Callback to save the new scroll position */
  onPositionChange: (position: number) => void;
  /** Whether scroll tracking is active (useful for conditionally rendered elements) */
  isActive?: boolean;
  /** Debounce delay in milliseconds (default: 100ms) */
  debounceMs?: number;
};

/**
 * Hook to persist and restore scroll position for a scrollable element.
 *
 * @param options Configuration options for scroll position persistence
 * @returns A callback ref to attach to the scrollable element

 */
export const useScrollPositionPersistence = ({
  debounceMs = 100,
  isActive = true,
  onPositionChange,
  savedPosition,
}: UseScrollPositionPersistenceOptions): RefCallback<HTMLDivElement> => {
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const hasRestoredRef = useRef(false);

  // Track when the element is attached to trigger effects
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  // Callback ref to detect when element is attached/detached
  const setRef = useCallback((node: HTMLDivElement | null) => {
    scrollableRef.current = node;
    setElement(node);
  }, []);

  // Keep refs to latest values to avoid stale closures in debounced function
  const onPositionChangeRef = useRef(onPositionChange);
  onPositionChangeRef.current = onPositionChange;

  const debouncedSetPositionRef = useRef(
    createCancellableDebounce((position: number) => {
      onPositionChangeRef.current(position);
    }, debounceMs),
  );

  // Reset restoration flag when panel becomes inactive
  useEffect(() => {
    if (!isActive) {
      hasRestoredRef.current = false;
    }
  }, [isActive]);

  // Restore scroll position when element becomes active or element is attached
  useLayoutEffect(() => {
    if (isActive && element && savedPosition > 0 && !hasRestoredRef.current) {
      element.scrollTop = savedPosition;
      hasRestoredRef.current = true;
    }
  }, [isActive, savedPosition, element]);

  // Set up scroll event listener to track position
  useEffect(() => {
    const debouncedSetPosition = debouncedSetPositionRef.current;

    const handleScroll = (event: Event) => {
      const target = event.currentTarget as HTMLDivElement;
      debouncedSetPositionRef.current(target?.scrollTop ?? 0);
    };

    if (element && isActive) {
      element.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (element) {
        element.removeEventListener('scroll', handleScroll);
        debouncedSetPosition.cancel();
      }
    };
  }, [isActive, element]);

  return setRef;
};
