import type { FC, ReactNode } from 'react';

import { HelperText, HelperTextItem } from '@patternfly/react-core';

type HelpTextProps = {
  children: ReactNode;
};

const HelpText: FC<HelpTextProps> = ({ children }) => {
  return (
    <HelperText>
      <HelperTextItem>{children}</HelperTextItem>
    </HelperText>
  );
};

export default HelpText;
