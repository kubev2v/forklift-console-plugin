import type { FC } from 'react';

import { HelperText, HelperTextItem, type HelperTextProps } from '@patternfly/react-core';

const HelpText: FC<HelperTextProps> = ({ children, ...props }) => {
  return (
    <HelperText {...props}>
      <HelperTextItem>{children}</HelperTextItem>
    </HelperText>
  );
};

export default HelpText;
