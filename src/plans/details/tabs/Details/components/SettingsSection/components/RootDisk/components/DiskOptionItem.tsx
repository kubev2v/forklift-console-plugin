import type { FC } from 'react';

import { HelperText, HelperTextItem, Text } from '@patternfly/react-core';

type DiskOptionItemProps = {
  label: string;
  description?: string;
};

const DiskOptionItem: FC<DiskOptionItemProps> = ({ description, label }) => (
  <>
    <Text>{label}</Text>
    {description && (
      <HelperText>
        <HelperTextItem variant="indeterminate">{description}</HelperTextItem>
      </HelperText>
    )}
  </>
);

export default DiskOptionItem;
