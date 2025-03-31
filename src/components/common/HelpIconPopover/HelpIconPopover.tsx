import React from 'react';

import { Popover, type PopoverProps } from '@patternfly/react-core';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';

type HelpIconPopoverProps = {
  children: React.ReactNode;
  header?: string;
  popoverProps?: Omit<PopoverProps, 'bodyContent' | 'titleContent'>;
};

export const HelpIconPopover: React.FC<HelpIconPopoverProps> = ({
  children,
  header,
  popoverProps,
}) => (
  <Popover position="right" bodyContent={children} headerContent={header} {...popoverProps}>
    <button type="button" className="pf-c-form__group-label-help">
      <HelpIcon />
    </button>
  </Popover>
);
