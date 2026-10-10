import { type FC, useLayoutEffect, useRef, useState } from 'react';

import { Tooltip } from '@patternfly/react-core';

type SelectDisabledTooltipProps = {
  reason: string;
  rowKey: string;
};

const SelectDisabledTooltip: FC<SelectDisabledTooltipProps> = ({ reason, rowKey }) => {
  const triggerRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    triggerRef.current = document.querySelector(
      `[data-testid="row-select-checkbox-${CSS.escape(rowKey)}"]`,
    );
    setReady(Boolean(triggerRef.current));
  }, [rowKey]);

  if (!ready || !triggerRef.current) {
    return null;
  }

  return <Tooltip content={reason} triggerRef={triggerRef} />;
};

export default SelectDisabledTooltip;
