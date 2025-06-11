import type { MouseEvent, ReactNode } from 'react';

import { Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

const LabelIcon = ({
  bodyContent,
  headerContent,
  onClick,
}: {
  bodyContent: ReactNode;
  headerContent: ReactNode;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) => (
  <Popover headerContent={headerContent} bodyContent={bodyContent}>
    <button
      type="button"
      aria-label="More info for field"
      onClick={onClick}
      aria-describedby="modal-with-form-form-field"
      className="pf-c-form__group-label-help"
    >
      <HelpIcon />
    </button>
  </Popover>
);

export default LabelIcon;
