import { type RefObject, useCallback, useLayoutEffect, useState } from 'react';

import { getResizeObserver } from '@patternfly/react-core';

export const useResizeObserver = (
  ref: RefObject<HTMLElement>,
  initialDimensions = { height: 400, width: 800 },
): { height: number; width: number } => {
  const [dimensions, setDimensions] = useState(initialDimensions);

  const handleResize = useCallback(() => {
    if (ref.current) {
      const { clientHeight: height, clientWidth: width } = ref.current;
      setDimensions({ height, width });
    }
  }, [ref]);

  useLayoutEffect(() => {
    if (ref.current) {
      const resizeObserver = getResizeObserver(ref.current, handleResize, true);
      handleResize();

      return (): void => {
        resizeObserver();
      };
    }
    return undefined;
  }, [ref, handleResize]);

  return dimensions;
};
